<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notifikasi Stok Menipis</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
        <div style="background:#ffffff;border:1px solid #e5e5e5;border-radius:14px;overflow:hidden;">
            <div style="padding:20px 24px;background:#1a1a1a;color:#ffffff;">
                <h1 style="margin:0;font-size:20px;">Notifikasi Stok Menipis</h1>
                <p style="margin:8px 0 0;font-size:13px;color:#d1d5db;">
                    Sistem inventaris mendeteksi produk yang perlu segera diperhatikan.
                </p>
            </div>

            <div style="padding:24px;">
                <p style="margin:0 0 16px;font-size:14px;">Halo {{ $recipientName }},</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">
                    Stok produk berikut sudah mencapai batas minimum dan membutuhkan tindak lanjut.
                </p>

                <div style="border:1px solid #e5e5e5;border-radius:12px;padding:18px;background:#fafafa;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:0 0 12px;font-size:13px;color:#666;">Nama Produk</td>
                            <td style="padding:0 0 12px;font-size:14px;font-weight:700;text-align:right;">{{ $product->name }}</td>
                        </tr>
                        <tr>
                            <td style="padding:0 0 12px;font-size:13px;color:#666;">Kode Produk</td>
                            <td style="padding:0 0 12px;font-size:14px;font-weight:700;text-align:right;">{{ $product->code }}</td>
                        </tr>
                        <tr>
                            <td style="padding:0 0 12px;font-size:13px;color:#666;">Kategori</td>
                            <td style="padding:0 0 12px;font-size:14px;font-weight:700;text-align:right;">{{ $product->category?->name ?? 'Tanpa kategori' }}</td>
                        </tr>
                        <tr>
                            <td style="padding:0 0 12px;font-size:13px;color:#666;">Stok Saat Ini</td>
                            <td style="padding:0 0 12px;font-size:14px;font-weight:700;text-align:right;">{{ number_format($product->stock, 0, ',', '.') }} {{ $product->unit }}</td>
                        </tr>
                        <tr>
                            <td style="padding:0;font-size:13px;color:#666;">Batas Minimum</td>
                            <td style="padding:0;font-size:14px;font-weight:700;text-align:right;">{{ number_format($product->min_stock, 0, ',', '.') }} {{ $product->unit }}</td>
                        </tr>
                    </table>
                </div>

                <p style="margin:20px 0 0;font-size:14px;line-height:1.6;">
                    Silakan buka aplikasi inventaris untuk melakukan pengecekan atau restock produk secepatnya.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
