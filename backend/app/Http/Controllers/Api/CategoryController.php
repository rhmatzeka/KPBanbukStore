<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use HandlesApiAccess;

    public function index(Request $request)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $categories = Category::withCount('products')->latest()->get();
        return response()->json($categories);
    }

    public function store(Request $request, AuditLogger $auditLogger)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => 'required',
            'description' => 'nullable'
        ]);

        $category = Category::create($validated);

        $auditLogger->log(
            $request,
            'create',
            'categories',
            'Menambahkan kategori ' . $category->name,
            null,
            $category->toArray(),
            $this->currentUser($request)
        );

        return response()->json($category, 201);
    }

    public function show(Request $request, $id)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $category = Category::with('products')->findOrFail($id);
        return response()->json($category);
    }

    public function update(Request $request, $id, AuditLogger $auditLogger)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $category = Category::findOrFail($id);
        $oldValues = $category->toArray();
        
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'nullable'
        ]);

        $category->update($validated);

        $auditLogger->log(
            $request,
            'update',
            'categories',
            'Mengubah kategori ' . $category->name,
            $oldValues,
            $category->toArray(),
            $this->currentUser($request)
        );

        return response()->json($category);
    }

    public function destroy(Request $request, $id, AuditLogger $auditLogger)
    {
        if ($response = $this->requireOwner($request)) {
            return $response;
        }

        $category = Category::findOrFail($id);
        $oldValues = $category->toArray();
        $category->delete();

        $auditLogger->log(
            $request,
            'delete',
            'categories',
            'Menghapus kategori ' . $oldValues['name'],
            $oldValues,
            null,
            $this->currentUser($request)
        );

        return response()->json(['message' => 'Category deleted']);
    }
}
