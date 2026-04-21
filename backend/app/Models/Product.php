<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'code', 'name', 'description', 'category_id', 
        'stock', 'min_stock', 'price', 'unit'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function stockOpnames()
    {
        return $this->hasMany(StockOpname::class);
    }
}
