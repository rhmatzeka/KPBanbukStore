<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\LowStockNotificationService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->latest()->get();
        return response()->json($products);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:products',
            'name' => 'required',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'unit' => 'required',
            'description' => 'nullable'
        ]);

        $product = Product::create($validated);
        return response()->json($product->load('category'), 201);
    }

    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json($product);
    }

    public function update(Request $request, $id, LowStockNotificationService $lowStockNotificationService)
    {
        $product = Product::findOrFail($id);
        $previousStock = (int) $product->stock;
        $previousMinStock = (int) $product->min_stock;
        
        $validated = $request->validate([
            'code' => 'required|unique:products,code,' . $id,
            'name' => 'required',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'unit' => 'required',
            'description' => 'nullable'
        ]);

        $product->update($validated);
        $product->load('category');

        $lowStockNotificationService->notifyIfThresholdReached(
            $product,
            $previousStock,
            $previousMinStock
        );

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
