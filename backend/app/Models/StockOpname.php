<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpname extends Model
{
    protected $fillable = [
        'opname_code',
        'product_id',
        'user_id',
        'system_stock',
        'physical_stock',
        'difference',
        'reason',
        'opname_date',
    ];

    protected $casts = [
        'opname_date' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
