<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalProducts = Product::count();
        $totalStock = Product::sum('stock');
        $lowStock = Product::whereColumn('stock', '<=', 'min_stock')->count();
        $todayTransactions = Transaction::whereDate('transaction_date', today())->count();
        $todayStockIn = Transaction::whereDate('transaction_date', today())
            ->where('type', 'in')
            ->sum('quantity');
        $todayStockOut = Transaction::whereDate('transaction_date', today())
            ->where('type', 'out')
            ->sum('quantity');
        $outOfStock = Product::where('stock', '<=', 0)->count();

        $recentTransactions = Transaction::with(['product', 'user'])
            ->latest('transaction_date')
            ->take(8)
            ->get();

        $stockByCategory = Product::select(
                'categories.id',
                'categories.name',
                DB::raw('COUNT(products.id) as products_count'),
                DB::raw('SUM(products.stock) as total_stock'),
                DB::raw('SUM(CASE WHEN products.stock <= products.min_stock THEN 1 ELSE 0 END) as low_stock_count')
            )
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_stock')
            ->get();

        $lowStockProducts = Product::with('category')
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderByRaw('(min_stock - stock) DESC')
            ->orderBy('stock')
            ->take(5)
            ->get();

        $topOutgoingProducts = Transaction::select(
                'products.id',
                'products.code',
                'products.name',
                'products.unit',
                DB::raw('SUM(transactions.quantity) as total_out')
            )
            ->join('products', 'transactions.product_id', '=', 'products.id')
            ->where('transactions.type', 'out')
            ->groupBy('products.id', 'products.code', 'products.name', 'products.unit')
            ->orderByDesc('total_out')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_products' => $totalProducts,
                'total_stock' => $totalStock,
                'low_stock' => $lowStock,
                'today_transactions' => $todayTransactions,
                'today_stock_in' => $todayStockIn,
                'today_stock_out' => $todayStockOut,
                'out_of_stock' => $outOfStock,
            ],
            'recent_transactions' => $recentTransactions,
            'stock_by_category' => $stockByCategory,
            'low_stock_products' => $lowStockProducts,
            'top_outgoing_products' => $topOutgoingProducts,
        ]);
    }

    public function chartData(Request $request)
    {
        $period = $request->get('period', 'daily');
        $customDate = $request->get('date');
        
        $query = Transaction::selectRaw('
            DATE(transaction_date) as date,
            SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END) as stock_in,
            SUM(CASE WHEN type = "out" THEN quantity ELSE 0 END) as stock_out
        ');

        if ($customDate) {
            switch ($period) {
                case 'yearly':
                    // Filter by specific year
                    $query->whereYear('transaction_date', $customDate);
                    $query->selectRaw('
                        MONTH(transaction_date) as month,
                        SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END) as stock_in,
                        SUM(CASE WHEN type = "out" THEN quantity ELSE 0 END) as stock_out
                    ');
                    $query->groupBy('month')->orderBy('month');
                    break;
                    
                case 'monthly':
                    // Filter by specific month (format: YYYY-MM)
                    $query->whereRaw('DATE_FORMAT(transaction_date, "%Y-%m") = ?', [$customDate]);
                    break;
                    
                case 'weekly':
                    // Filter by week of specific date
                    $date = new \DateTime($customDate);
                    $startOfWeek = $date->modify('monday this week')->format('Y-m-d');
                    $endOfWeek = $date->modify('sunday this week')->format('Y-m-d');
                    $query->whereBetween('transaction_date', [$startOfWeek, $endOfWeek]);
                    break;
                    
                default: // daily
                    // Filter by specific date
                    $query->whereDate('transaction_date', $customDate);
                    break;
            }
        } else {
            // Default ranges when no custom date
            switch ($period) {
                case 'weekly':
                    $query->where('transaction_date', '>=', now()->subWeeks(1));
                    break;
                case 'monthly':
                    $query->where('transaction_date', '>=', now()->subMonth());
                    break;
                case 'yearly':
                    $query->where('transaction_date', '>=', now()->subYear());
                    $query->selectRaw('
                        MONTH(transaction_date) as month,
                        SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END) as stock_in,
                        SUM(CASE WHEN type = "out" THEN quantity ELSE 0 END) as stock_out
                    ');
                    $query->groupBy('month')->orderBy('month');
                    break;
                default: // daily
                    $query->where('transaction_date', '>=', now()->subDays(7));
            }
        }

        if ($period !== 'yearly' || !$customDate) {
            $data = $query->groupBy('date')->orderBy('date')->get();
        } else {
            $data = $query->get()->map(function($item) {
                $monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                $item->date = $monthNames[$item->month];
                return $item;
            });
        }

        return response()->json($data);
    }
}
