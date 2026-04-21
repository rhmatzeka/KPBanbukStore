<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Services\AuditLogger;
use App\Services\LowStockNotificationService;
use Illuminate\Http\Request;
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
