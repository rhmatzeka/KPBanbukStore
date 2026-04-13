<?php

namespace App\Services;

use App\Mail\LowStockAlertMail;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Throwable;

class LowStockNotificationService
{
    public function notifyIfThresholdReached(Product $product, int $previousStock, ?int $previousMinStock = null): void
    {
        $product->loadMissing('category');

        $previousMinStock ??= (int) $product->min_stock;

        $wasLowStock = $previousStock <= $previousMinStock;
        $isLowStock = (int) $product->stock <= (int) $product->min_stock;

        if (! $isLowStock || $wasLowStock) {
            return;
        }

        $recipients = User::query()
            ->whereNotNull('email')
            ->whereHas('role', function ($query) {
                $query->whereIn('name', ['owner', 'admin']);
            })
            ->get();

        foreach ($recipients as $recipient) {
            try {
                Mail::to($recipient->email)->send(new LowStockAlertMail($product, $recipient->name));
            } catch (Throwable $exception) {
                report($exception);
            }
        }
    }
}
