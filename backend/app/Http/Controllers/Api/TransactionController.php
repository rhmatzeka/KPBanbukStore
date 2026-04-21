<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Services\AuditLogger;
use App\Services\LowStockNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    use HandlesApiAccess;

    public function index(Request $request)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $transactions = Transaction::with(['product', 'user'])
            ->latest('transaction_date')
            ->get();
        return response()->json($transactions);
    }

    public function store(
        Request $request,
        LowStockNotificationService $lowStockNotificationService,
        AuditLogger $auditLogger
    )
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable',
            'transaction_date' => 'required|date'
        ]);

        $actor = $this->currentUser($request);
        $validated['user_id'] = $actor->id;
        $validated['transaction_code'] = 'TRX-' . strtoupper(Str::random(8));

        $product = Product::find($validated['product_id']);
        $previousStock = (int) $product->stock;
        
        if ($validated['type'] === 'in') {
            $product->stock += $validated['quantity'];
        } else {
            if ($product->stock < $validated['quantity']) {
                return response()->json(['message' => 'Insufficient stock'], 400);
            }
            $product->stock -= $validated['quantity'];
        }
        
        $product->save();

        $transaction = Transaction::create($validated);

        $lowStockNotificationService->notifyIfThresholdReached(
            $product->fresh('category'),
            $previousStock
        );

        $auditLogger->log(
            $request,
            'create',
            'transactions',
            'Mencatat barang ' . ($validated['type'] === 'in' ? 'masuk' : 'keluar') . ' untuk produk ' . $product->name,
            ['stock' => $previousStock],
            [
                'transaction_code' => $transaction->transaction_code,
                'product_id' => $product->id,
                'type' => $transaction->type,
                'quantity' => $transaction->quantity,
                'stock' => $product->stock,
            ],
            $actor
        );

        return response()->json($transaction->load(['product', 'user']), 201);
    }

    public function show(Request $request, $id)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $transaction = Transaction::with(['product', 'user'])->findOrFail($id);
        return response()->json($transaction);
    }

    public function update(
        Request $request,
        $id,
        LowStockNotificationService $lowStockNotificationService,
        AuditLogger $auditLogger
    ) {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable',
            'transaction_date' => 'required|date'
        ]);

        $actor = $this->currentUser($request);

        $transaction = DB::transaction(function () use (
            $id,
            $validated,
            $request,
            $actor,
            $auditLogger,
            $lowStockNotificationService
        ) {
            $transaction = Transaction::with(['product', 'user'])->lockForUpdate()->findOrFail($id);
            $oldValues = $transaction->toArray();

            $oldProductId = (int) $transaction->product_id;
            $newProductId = (int) $validated['product_id'];
            $productIds = collect([$oldProductId, $newProductId])->unique()->values();
            $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');

            $oldProduct = $products[$oldProductId];
            $newProduct = $products[$newProductId];

            $stockSnapshots = [
                $oldProductId => (int) $oldProduct->stock,
            ];

            if ($newProductId !== $oldProductId) {
                $stockSnapshots[$newProductId] = (int) $newProduct->stock;
            }

            $oldImpact = $transaction->type === 'in'
                ? (int) $transaction->quantity
                : -1 * (int) $transaction->quantity;
            $newImpact = $validated['type'] === 'in'
                ? (int) $validated['quantity']
                : -1 * (int) $validated['quantity'];

            if ($oldProductId === $newProductId) {
                $newStock = (int) $oldProduct->stock - $oldImpact + $newImpact;

                if ($newStock < 0) {
                    return response()->json(['message' => 'Stok tidak cukup untuk perubahan transaksi ini'], 400);
                }

                $oldProduct->stock = $newStock;
                $oldProduct->save();
            } else {
                $oldProductStock = (int) $oldProduct->stock - $oldImpact;
                $newProductStock = (int) $newProduct->stock + $newImpact;

                if ($oldProductStock < 0 || $newProductStock < 0) {
                    return response()->json(['message' => 'Stok tidak cukup untuk perubahan transaksi ini'], 400);
                }

                $oldProduct->stock = $oldProductStock;
                $oldProduct->save();

                $newProduct->stock = $newProductStock;
                $newProduct->save();
            }

            $transaction->update($validated);
            $transaction->load(['product', 'user']);

            foreach ($products as $product) {
                $lowStockNotificationService->notifyIfThresholdReached(
                    $product->fresh('category'),
                    $stockSnapshots[$product->id]
                );
            }

            $auditLogger->log(
                $request,
                'update',
                'transactions',
                'Mengubah transaksi ' . $transaction->transaction_code,
                $oldValues,
                [
                    'transaction' => $transaction->toArray(),
                    'stock_before' => $stockSnapshots,
                    'stock_after' => $products->mapWithKeys(fn ($product) => [
                        $product->id => (int) $product->fresh()->stock,
                    ])->toArray(),
                ],
                $actor
            );

            return $transaction;
        });

        if ($transaction instanceof \Illuminate\Http\JsonResponse) {
            return $transaction;
        }

        return response()->json($transaction);
    }

    public function destroy(Request $request, $id, AuditLogger $auditLogger)
    {
        if ($response = $this->requireOwner($request)) {
            return $response;
        }

        $transaction = Transaction::findOrFail($id);
        $oldValues = $transaction->load(['product', 'user'])->toArray();
        $transaction->delete();

        $auditLogger->log(
            $request,
            'delete',
            'transactions',
            'Menghapus transaksi ' . $oldValues['transaction_code'],
            $oldValues,
            null,
            $this->currentUser($request)
        );

        return response()->json(['message' => 'Transaction deleted']);
    }
}
