import { Resend } from 'resend';

export async function sendLowStockEmail({ productName, productCode, currentStock, minStock, unit }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const emailToOwner = process.env.EMAIL_TO_OWNER || 'owner@gudang.com';

  if (!resendApiKey) {
    console.warn('Resend API key is not configured. Email notification skipped.');
    return;
  }

  try {
    const resend = new Resend(resendApiKey);
    const data = await resend.emails.send({
      from: emailFrom,
      to: emailToOwner,
      subject: `⚠️ PERINGATAN STOK MENIPIS: ${productName} (${productCode})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Peringatan Stok Menipis!</h1>
          </div>
          <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
            <p>Halo Owner,</p>
            <p>Sistem inventaris mendeteksi bahwa stok produk berikut telah berada di bawah atau sama dengan batas minimum:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f8fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Kode Produk</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${productCode}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Nama Produk</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${productName}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Stok Saat Ini</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; color: #ef4444; font-weight: bold;">${currentStock} ${unit}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Stok Minimum</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${minStock} ${unit}</td>
              </tr>
            </table>

            <p style="margin-top: 24px;">Harap segera lakukan pemesanan ulang ke supplier untuk menghindari kekosongan stok.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
              Aplikasi Inventaris Gudang &copy; ${new Date().getFullYear()}
            </div>
          </div>
        </div>
      `,
    });
    console.log('Low stock notification email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send low stock notification email:', error);
  }
}
