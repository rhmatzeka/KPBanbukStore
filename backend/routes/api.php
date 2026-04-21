<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\StockOpnameController;
use App\Http\Controllers\Api\AuditLogController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/chart', [DashboardController::class, 'chartData']);
    Route::get('/roles', function() {
        return response()->json(\App\Models\Role::all());
    });
    
    Route::apiResource('products', ProductController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('transactions', TransactionController::class)->except(['update']);
    Route::apiResource('users', UserController::class);
    Route::get('/stock-opnames', [StockOpnameController::class, 'index']);
    Route::post('/stock-opnames', [StockOpnameController::class, 'store']);
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
});
