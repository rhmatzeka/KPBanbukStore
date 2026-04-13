import React, { useState, useEffect } from 'react';
import api from '../api';
import Loading from './Loading';

/* eslint-disable react-hooks/exhaustive-deps */

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user.role?.name === 'owner') {
      fetchChartData();
    }
  }, [period, customDate, user]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
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
    const max = Math.max(
      ...chartData.map(d => Math.max(d.stock_in, d.stock_out))
    );
    return Math.ceil(max / 10) * 10;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Ringkasan Operasional</span>
        <h1>Dashboard</h1>
        <p>Selamat datang, {user.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Produk</h3>
          <div className="value">{stats?.stats.total_products || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Stok</h3>
          <div className="value">{stats?.stats.total_stock || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Stok Menipis</h3>
          <div className="value">{stats?.stats.low_stock || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Transaksi Hari Ini</h3>
          <div className="value">{stats?.stats.today_transactions || 0}</div>
        </div>
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
                    period === 'yearly' ? 'Pilih tahun' :
                    period === 'monthly' ? 'Pilih bulan' :
                    period === 'weekly' ? 'Pilih minggu' :
                    'Pilih tanggal'
                  }
                  className="date-input"
                  min={period === 'yearly' ? '2020' : undefined}
                  max={period === 'yearly' ? new Date().getFullYear() : undefined}
                />
                {customDate && (
                  <button 
                    className="clear-date-btn"
                    onClick={() => setCustomDate('')}
                    title="Reset"
                  >
                    ✕
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
                          style={{height: `${inHeight}px`}}
                          title={`Masuk: ${data.stock_in}`}
                        ></div>
                        <div 
                          className="bar bar-out" 
                          style={{height: `${outHeight}px`}}
                          title={`Keluar: ${data.stock_out}`}
                        ></div>
                      </div>
                      <div className="bar-label">
                        {period === 'yearly' && customDate ? 
                          data.date : 
                          new Date(data.date).toLocaleDateString('id-ID', { 
                            day: '2-digit', 
                            month: 'short' 
                          })
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{padding: '40px', textAlign: 'center', color: '#757575'}}>
                Tidak ada data transaksi
              </div>
            )}
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{background: '#2e7d32'}}></div>
                <span>Barang Masuk</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{background: '#c62828'}}></div>
                <span>Barang Keluar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>Transaksi Terbaru</h2>
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
            {stats?.recent_transactions.map((trx) => (
              <tr key={trx.id}>
                <td data-label="Kode">{trx.transaction_code}</td>
                <td data-label="Produk">{trx.product?.name}</td>
                <td data-label="Tipe">
                  <span className={`badge ${trx.type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                    {trx.type === 'in' ? 'Masuk' : 'Keluar'}
                  </span>
                </td>
                <td data-label="Jumlah">{trx.quantity}</td>
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

export default Dashboard;
