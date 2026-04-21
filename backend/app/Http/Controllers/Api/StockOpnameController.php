<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockOpname;
use App\Services\AuditLogger;
use App\Services\LowStockNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockOpnameController extends Controller
{
    use HandlesApiAccess;

    public function index(Request $request)
    {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $opnames = StockOpname::with(['product.category', 'user'])
            ->latest('opname_date')
            ->latest()
            ->get();

        return response()->json($opnames);
    }

    public function store(
        Request $request,
        AuditLogger $auditLogger,
        LowStockNotificationService $lowStockNotificationService
    ) {
        if ($response = $this->requireOwnerOrAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'physical_stock' => 'required|integer|min:0',
            'reason' => 'required|string|min:3',
            'opname_date' => 'required|date',
        ]);

        $actor = $this->currentUser($request);

        $opname = DB::transaction(function () use ($validated, $actor, $request, $auditLogger, $lowStockNotificationService) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
            $systemStock = (int) $product->stock;
            $physicalStock = (int) $validated['physical_stock'];
            $previousStock = $systemStock;

            $opname = StockOpname::create([
                'opname_code' => 'OPN-' . strtoupper(Str::random(8)),
                'product_id' => $product->id,
                'user_id' => $actor?->id,
                'system_stock' => $systemStock,
                'physical_stock' => $physicalStock,
                'difference' => $physicalStock - $systemStock,
                'reason' => $validated['reason'],
                'opname_date' => $validated['opname_date'],
            ]);

            $product->stock = $physicalStock;
            $product->save();

            $lowStockNotificationService->notifyIfThresholdReached(
                $product->fresh('category'),
                $previousStock
            );

            $auditLogger->log(
                $request,
                'create',
                'stock_opname',
                'Melakukan stock opname untuk produk ' . $product->name,
                ['stock' => $systemStock],
                [
                    'opname_code' => $opname->opname_code,
                    'product_id' => $product->id,
                    'physical_stock' => $physicalStock,
                    'difference' => $opname->difference,
                    'reason' => $opname->reason,
                ],
                $actor
            );

            return $opname;
        });

        return response()->json($opname->load(['product.category', 'user']), 201);
    }
}
