<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\AuditLogger;
use App\Services\LowStockNotificationService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use HandlesApiAccess;

    public function index(Request $request)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $products = Product::with('category')->latest()->get();
        return response()->json($products);
    }
    
    public function store(Request $request, AuditLogger $auditLogger)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

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

        $auditLogger->log(
            $request,
            'create',
            'products',
            'Menambahkan produk ' . $product->name,
            null,
            $product->toArray(),
            $this->currentUser($request)
        );

        return response()->json($product->load('category'), 201);
    }

    public function show(Request $request, $id)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $product = Product::with('category')->findOrFail($id);
        return response()->json($product);
    }

    public function update(
        Request $request,
        $id,
        LowStockNotificationService $lowStockNotificationService,
        AuditLogger $auditLogger
    )
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $product = Product::findOrFail($id);
        $oldValues = $product->toArray();
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

        $auditLogger->log(
            $request,
            'update',
            'products',
            'Mengubah produk ' . $product->name,
            $oldValues,
            $product->toArray(),
            $this->currentUser($request)
        );

        return response()->json($product);
    }

    public function destroy(Request $request, $id, AuditLogger $auditLogger)
    {
        if ($response = $this->requireOwner($request)) {
            return $response;
        }

        $product = Product::findOrFail($id);
        $oldValues = $product->toArray();
        $product->delete();

        $auditLogger->log(
            $request,
            'delete',
            'products',
            'Menghapus produk ' . $oldValues['name'],
            $oldValues,
            null,
            $this->currentUser($request)
        );

        return response()->json(['message' => 'Product deleted']);
    }
}
