import React, { useEffect, useState } from 'react';
import api from '../api';
import Loading from './Loading';

/* eslint-disable react-hooks/exhaustive-deps */

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value || 0);

function DashboardEnhanced({ user, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (user.role?.name === 'owner') {
      fetchChartData();
    }
  }, [period, customDate, user]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      let url = `/dashboard/chart?period=${period}`;
      if (customDate) {
        url += `&date=${customDate}`;
      }
      const response = await api.get(url);
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching chart:', error);
    }
  };

  const getMaxValue = () => {
    if (!chartData.length) return 100;
    const max = Math.max(...chartData.map((item) => Math.max(item.stock_in, item.stock_out)));
    return Math.ceil(max / 10) * 10;
  };

  if (loading) {
    return <Loading />;
  }

  const dashboardStats = stats?.stats || {};
  const recentTransactions = stats?.recent_transactions || [];
  const lowStockProducts = stats?.low_stock_products || [];
  const stockByCategory = stats?.stock_by_category || [];
  const topOutgoingProducts = stats?.top_outgoing_products || [];

  const quickActions = [
    { label: 'Tambah Transaksi', helper: 'Catat barang masuk dan keluar', page: 'transactions' },
    { label: 'Kelola Produk', helper: 'Perbarui stok dan detail barang', page: 'products' },
    { label: 'Kelola Kategori', helper: 'Rapikan struktur inventaris', page: 'categories' },
  ];

  if (user.role?.name === 'admin') {
    quickActions.push({ label: 'Kelola User', helper: 'Atur akun operasional', page: 'users' });
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Ringkasan Operasional</span>
        <h1>Dashboard</h1>
        <p>Selamat datang, {user.name}. Pantau stok, aktivitas harian, dan tindakan penting dari satu layar.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Produk</h3>
          <div className="value">{formatNumber(dashboardStats.total_products)}</div>
        </div>
        <div className="stat-card">
          <h3>Total Stok</h3>
          <div className="value">{formatNumber(dashboardStats.total_stock)}</div>
        </div>
        <div className="stat-card">
          <h3>Stok Menipis</h3>
          <div className="value">{formatNumber(dashboardStats.low_stock)}</div>
        </div>
        <div className="stat-card">
          <h3>Transaksi Hari Ini</h3>
          <div className="value">{formatNumber(dashboardStats.today_transactions)}</div>
        </div>
      </div>

      <div className="dashboard-section-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Aksi Cepat</h2>
              <p>Pindah ke menu yang paling sering dipakai tanpa bolak-balik sidebar.</p>
            </div>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <button
                key={action.page}
                type="button"
                className="quick-action-card"
                onClick={() => onNavigate?.(action.page)}
              >
                <strong>{action.label}</strong>
                <span>{action.helper}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Aktivitas Hari Ini</h2>
              <p>Ringkasan cepat arus barang dan stok yang perlu perhatian.</p>
            </div>
          </div>
          <div className="mini-stats-grid">
            <div className="mini-stat-card">
              <span>Barang Masuk</span>
              <strong>{formatNumber(dashboardStats.today_stock_in)}</strong>
            </div>
            <div className="mini-stat-card">
              <span>Barang Keluar</span>
              <strong>{formatNumber(dashboardStats.today_stock_out)}</strong>
            </div>
            <div className="mini-stat-card mini-stat-card-alert">
              <span>Stok Habis</span>
              <strong>{formatNumber(dashboardStats.out_of_stock)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section-grid">
        <div className="dashboard-panel dashboard-panel-warning">
          <div className="dashboard-panel-header">
            <div>
              <h2>Alert Stok Menipis</h2>
              <p>Prioritas produk yang perlu segera direstock.</p>
            </div>
            <button type="button" className="btn btn-alert-action" onClick={() => onNavigate?.('products')}>
              Buka Produk
            </button>
          </div>
          {lowStockProducts.length ? (
            <div className="dashboard-list">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="dashboard-list-item dashboard-list-item-warning">
                  <div className="dashboard-list-main">
                    <span className="alert-chip">Perlu Restock</span>
                    <strong>{product.name}</strong>
                    <span>{product.category?.name || 'Tanpa kategori'}</span>
                  </div>
                  <div className="dashboard-list-meta">
                    <strong className="stock-warning-value">{formatNumber(product.stock)} {product.unit}</strong>
                    <span className="stock-warning-min">Min. {formatNumber(product.min_stock)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">Belum ada produk yang melewati batas minimum stok.</div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Produk Paling Sering Keluar</h2>
              <p>Membantu admin menentukan prioritas pengadaan ulang.</p>
            </div>
          </div>
          {topOutgoingProducts.length ? (
            <div className="dashboard-list">
              {topOutgoingProducts.map((product) => (
                <div key={product.id} className="dashboard-list-item">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.code}</span>
                  </div>
                  <div className="dashboard-list-meta">
                    <strong>{formatNumber(product.total_out)} {product.unit}</strong>
                    <span>Total keluar</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">Belum ada data barang keluar untuk dirangkum.</div>
          )}
        </div>
      </div>

      <div className="dashboard-panel dashboard-panel-full">
        <div className="dashboard-panel-header">
          <div>
            <h2>Ringkasan Per Kategori</h2>
            <p>Lihat komposisi stok per kategori beserta item yang mulai menipis.</p>
          </div>
        </div>
        {stockByCategory.length ? (
          <div className="category-summary-grid">
            {stockByCategory.map((category) => (
              <div key={category.id} className="category-summary-card">
                <strong>{category.name}</strong>
                <span>{formatNumber(category.products_count)} produk</span>
                <div className="category-summary-metrics">
                  <div>
                    <small>Total stok</small>
                    <b>{formatNumber(category.total_stock)}</b>
                  </div>
                  <div>
                    <small>Stok menipis</small>
                    <b>{formatNumber(category.low_stock_count)}</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">Belum ada kategori yang bisa ditampilkan.</div>
        )}
      </div>

      {user.role?.name === 'owner' && (
        <div className="chart-container">
          <div className="chart-header">
            <h2>Grafik Transaksi</h2>
            <div className="chart-controls">
              <div className="period-selector">
                <button
                  className={`period-btn ${period === 'daily' ? 'active' : ''}`}
                  onClick={() => setPeriod('daily')}
                >
                  Harian
                </button>
                <button
                  className={`period-btn ${period === 'weekly' ? 'active' : ''}`}
                  onClick={() => setPeriod('weekly')}
                >
                  Mingguan
                </button>
                <button
                  className={`period-btn ${period === 'monthly' ? 'active' : ''}`}
                  onClick={() => setPeriod('monthly')}
                >
                  Bulanan
                </button>
                <button
                  className={`period-btn ${period === 'yearly' ? 'active' : ''}`}
                  onClick={() => setPeriod('yearly')}
                >
                  Tahunan
                </button>
              </div>
              <div className="date-picker">
                <input
                  type={period === 'yearly' ? 'number' : period === 'monthly' ? 'month' : 'date'}
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  placeholder={
                    period === 'yearly'
                      ? 'Pilih tahun'
                      : period === 'monthly'
                        ? 'Pilih bulan'
                        : period === 'weekly'
                          ? 'Pilih minggu'
                          : 'Pilih tanggal'
                  }
                  className="date-input"
                  min={period === 'yearly' ? '2020' : undefined}
                  max={period === 'yearly' ? new Date().getFullYear() : undefined}
                />
                {customDate && (
                  <button
                    type="button"
                    className="clear-date-btn"
                    onClick={() => setCustomDate('')}
                    title="Reset"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="chart">
            {chartData.length > 0 ? (
              <div className="bar-chart">
                {chartData.map((data, index) => {
                  const maxValue = getMaxValue();
                  const inHeight = (data.stock_in / maxValue) * 200;
                  const outHeight = (data.stock_out / maxValue) * 200;

                  return (
                    <div key={index} className="bar-group">
                      <div className="bars">
                        <div
                          className="bar bar-in"
                          style={{ height: `${inHeight}px` }}
                          title={`Masuk: ${data.stock_in}`}
                        ></div>
                        <div
                          className="bar bar-out"
                          style={{ height: `${outHeight}px` }}
                          title={`Keluar: ${data.stock_out}`}
                        ></div>
                      </div>
                      <div className="bar-label">
                        {period === 'yearly' && customDate
                          ? data.date
                          : new Date(data.date).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                            })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                Tidak ada data transaksi
              </div>
            )}
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#2e7d32' }}></div>
                <span>Barang Masuk</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#c62828' }}></div>
                <span>Barang Keluar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>Transaksi Terbaru</h2>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate?.('transactions')}>
            Buka Transaksi
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Produk</th>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>User</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((trx) => (
                <tr key={trx.id}>
                  <td data-label="Kode">{trx.transaction_code}</td>
                  <td data-label="Produk">{trx.product?.name}</td>
                  <td data-label="Tipe">
                    <span className={`badge ${trx.type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                      {trx.type === 'in' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td data-label="Jumlah">{formatNumber(trx.quantity)}</td>
                  <td data-label="User">{trx.user?.name}</td>
                  <td data-label="Tanggal">{new Date(trx.transaction_date).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardEnhanced;
