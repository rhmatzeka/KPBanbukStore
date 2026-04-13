import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import gsap from 'gsap';

function DashboardAnimated({ user }) {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Refs for animations
  const headerRef = useRef(null);
  const statsRefs = useRef([]);
  const chartRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (user.role?.name === 'owner') {
      fetchChartData();
    }
  }, [period, customDate, user]);

  useEffect(() => {
    if (!loading && stats) {
      animateEntrance();
    }
  }, [loading, stats]);

  const animateEntrance = () => {
    const tl = gsap.timeline();

    // Header animation
    tl.from(headerRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    // Stats cards stagger animation
    .from(statsRefs.current, {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    }, '-=0.3');

    // Animate numbers counting up
    statsRefs.current.forEach((ref, index) => {
      if (ref) {
        const valueElement = ref.querySelector('.value');
        if (valueElement) {
          const finalValue = parseInt(valueElement.textContent);
          gsap.from(valueElement, {
            textContent: 0,
            duration: 1.5,
            ease: 'power2.out',
            snap: { textContent: 1 },
            delay: index * 0.1
          });
        }
      }
    });

    // Chart animation
    if (chartRef.current) {
      tl.from(chartRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.4');
    }

    // Table animation
    if (tableRef.current) {
      tl.from(tableRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.4');
    }
  };

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
      
      // Animate bars when data changes
      if (chartRef.current) {
        const bars = chartRef.current.querySelectorAll('.bar');
        gsap.from(bars, {
          scaleY: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power3.out',
          transformOrigin: 'bottom'
        });
      }
    } catch (error) {
      console.error('Error fetching chart:', error);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setCustomDate('');
  };

  const getMaxValue = () => {
    if (!chartData.length) return 100;
    const max = Math.max(
      ...chartData.map(d => Math.max(d.stock_in, d.stock_out))
    );
    return Math.ceil(max / 10) * 10;
  };

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <div className="spinner" style={{width: '40px', height: '40px'}}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" ref={headerRef}>
        <h1>Dashboard</h1>
        <p>Selamat datang, {user.name}</p>
      </div>

      <div className="stats-grid">
        <div 
          className="stat-card" 
          ref={el => statsRefs.current[0] = el}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              y: -8,
              duration: 0.3,
              ease: 'power2.out'
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out'
            });
          }}
        >
          <h3>Total Produk</h3>
          <div className="value">{stats?.stats.total_products || 0}</div>
        </div>
        <div 
          className="stat-card" 
          ref={el => statsRefs.current[1] = el}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              y: -8,
              duration: 0.3,
              ease: 'power2.out'
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out'
            });
          }}
        >
          <h3>Total Stok</h3>
          <div className="value">{stats?.stats.total_stock || 0}</div>
        </div>
        <div 
          className="stat-card" 
          ref={el => statsRefs.current[2] = el}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              y: -8,
              duration: 0.3,
              ease: 'power2.out'
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out'
            });
          }}
        >
          <h3>Stok Menipis</h3>
          <div className="value">{stats?.stats.low_stock || 0}</div>
        </div>
        <div 
          className="stat-card" 
          ref={el => statsRefs.current[3] = el}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              y: -8,
              duration: 0.3,
              ease: 'power2.out'
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out'
            });
          }}
        >
          <h3>Transaksi Hari Ini</h3>
          <div className="value">{stats?.stats.today_transactions || 0}</div>
        </div>
      </div>

      {user.role?.name === 'owner' && (
        <div className="chart-container" ref={chartRef}>
          <div className="chart-header">
            <h2>Grafik Transaksi</h2>
            <div className="chart-controls">
              <div className="period-selector">
                {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                  <button 
                    key={p}
                    className={`period-btn ${period === p ? 'active' : ''}`}
                    onClick={() => handlePeriodChange(p)}
                  >
                    {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : p === 'monthly' ? 'Bulanan' : 'Tahunan'}
                  </button>
                ))}
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
              <div style={{padding: '40px', textAlign: 'center', color: '#888'}}>
                Tidak ada data transaksi
              </div>
            )}
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 100%)'}}></div>
                <span>Barang Masuk</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{background: 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)'}}></div>
                <span>Barang Keluar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-container" ref={tableRef}>
        <div className="table-header">
          <h2>Transaksi Terbaru</h2>
        </div>
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
                <td>{trx.transaction_code}</td>
                <td>{trx.product?.name}</td>
                <td>
                  <span className={`badge ${trx.type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                    {trx.type === 'in' ? 'Masuk' : 'Keluar'}
                  </span>
                </td>
                <td>{trx.quantity}</td>
                <td>{trx.user?.name}</td>
                <td>{new Date(trx.transaction_date).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardAnimated;
