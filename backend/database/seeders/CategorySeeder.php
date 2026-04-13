<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Elektronik', 'description' => 'Barang elektronik dan gadget'],
            ['name' => 'Furniture', 'description' => 'Mebel dan perabotan'],
            ['name' => 'Alat Tulis', 'description' => 'Perlengkapan kantor dan alat tulis'],
            ['name' => 'Makanan', 'description' => 'Produk makanan dan minuman'],
            ['name' => 'Pakaian', 'description' => 'Pakaian dan aksesoris'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
