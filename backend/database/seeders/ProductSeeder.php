<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'code' => 'ELK001',
                'name' => 'Laptop Dell',
                'category_id' => 1,
                'stock' => 15,
                'min_stock' => 5,
                'price' => 8500000,
                'unit' => 'pcs',
                'description' => 'Laptop Dell Inspiron 15'
            ],
            [
                'code' => 'ELK002',
                'name' => 'Mouse Wireless',
                'category_id' => 1,
                'stock' => 50,
                'min_stock' => 20,
                'price' => 150000,
                'unit' => 'pcs',
                'description' => 'Mouse wireless Logitech'
            ],
            [
                'code' => 'FUR001',
                'name' => 'Kursi Kantor',
                'category_id' => 2,
                'stock' => 8,
                'min_stock' => 3,
                'price' => 1200000,
                'unit' => 'pcs',
                'description' => 'Kursi kantor ergonomis'
            ],
            [
                'code' => 'ATK001',
                'name' => 'Kertas A4',
                'category_id' => 3,
                'stock' => 100,
                'min_stock' => 30,
                'price' => 45000,
                'unit' => 'rim',
                'description' => 'Kertas A4 80 gram'
            ],
            [
                'code' => 'ATK002',
                'name' => 'Pulpen',
                'category_id' => 3,
                'stock' => 200,
                'min_stock' => 50,
                'price' => 3000,
                'unit' => 'pcs',
                'description' => 'Pulpen hitam'
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
