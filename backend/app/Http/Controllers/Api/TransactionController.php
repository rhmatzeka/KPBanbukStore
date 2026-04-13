<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Services\LowStockNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['product', 'user'])
            ->latest('transaction_date')
            ->get();
        return response()->json($transactions);
    }

    public function store(Request $request, LowStockNotificationService $lowStockNotificationService)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable',
            'transaction_date' => 'required|date'
        ]);

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

        return response()->json($transaction->load(['product', 'user']), 201);
    }

    public function show($id)
    {
        $transaction = Transaction::with(['product', 'user'])->findOrFail($id);
        return response()->json($transaction);
    }

    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();
        return response()->json(['message' => 'Transaction deleted']);
    }
}
