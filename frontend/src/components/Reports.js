import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import Loading from './Loading';

/* eslint-disable react-hooks/exhaustive-deps */

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value || 0);

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID');
};

const toCsvValue = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    productId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [transactionsResponse, productsResponse] = await Promise.all([
      api.get('/transactions'),
      api.get('/products'),
    ]);
    setTransactions(transactionsResponse.data);
    setProducts(productsResponse.data);
    setLoading(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transaction_date);
      const startDate = filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null;
      const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59`) : null;

      if (startDate && transactionDate < startDate) return false;
      if (endDate && transactionDate > endDate) return false;
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.productId && String(transaction.product_id) !== String(filters.productId)) return false;

      return true;
    });
  }, [transactions, filters]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (result, transaction) => {
        const quantity = parseInt(transaction.quantity || 0, 10);

        if (transaction.type === 'in') {
          result.stockIn += quantity;
        } else {
          result.stockOut += quantity;
        }

        result.totalTransactions += 1;
        return result;
      },
      {
        totalTransactions: 0,
        stockIn: 0,
        stockOut: 0,
      }
    );
  }, [filteredTransactions]);

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      productId: '',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const exportCsv = () => {
    const rows = [
      ['Kode', 'Produk', 'Tipe', 'Jumlah', 'Satuan', 'User', 'Catatan', 'Tanggal'],
      ...filteredTransactions.map((transaction) => [
        transaction.transaction_code,
        transaction.product?.name || '-',
        transaction.type === 'in' ? 'Masuk' : 'Keluar',
        transaction.quantity,
        transaction.product?.unit || '-',
        transaction.user?.name || '-',
        transaction.notes || '-',
        formatDate(transaction.transaction_date),
      ]),
    ];

    const csv = rows.map((row) => row.map(toCsvValue).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];

    link.href = url;
    link.download = `laporan-transaksi-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="report-page">
      <div className="page-header no-print">
        <span className="page-eyebrow">Dokumen Operasional</span>
        <h1>Laporan</h1>
        <p>Filter transaksi gudang lalu cetak sebagai PDF atau export ke CSV.</p>
      </div>

      <div className="table-container no-print">
        <div className="table-header report-filter-header">
          <h2>Filter Laporan</h2>
          <div className="report-actions">
            <button type="button" className="btn btn-secondary" onClick={resetFilters}>
              Reset
            </button>
            <button type="button" className="btn btn-secondary" onClick={exportCsv}>
              Export CSV
            </button>
            <button type="button" className="btn btn-primary" onClick={handlePrint}>
              Cetak PDF
            </button>
          </div>
        </div>
        <div className="report-filters">
          <div className="form-group">
            <label>Dari Tanggal</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Sampai Tanggal</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Tipe</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">Semua Tipe</option>
              <option value="in">Barang Masuk</option>
              <option value="out">Barang Keluar</option>
            </select>
          </div>
          <div className="form-group">
            <label>Produk</label>
            <select
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
            >
              <option value="">Semua Produk</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="print-area">
        <div className="report-print-header">
          <h1>Laporan Transaksi Gudang</h1>
          <p>
            Periode: {filters.startDate || 'Awal'} sampai {filters.endDate || 'Akhir'} | Tipe:{' '}
            {filters.type ? (filters.type === 'in' ? 'Barang Masuk' : 'Barang Keluar') : 'Semua'}
          </p>
        </div>

        <div className="stats-grid report-summary-grid">
          <div className="stat-card">
            <h3>Total Transaksi</h3>
            <div className="value">{formatNumber(summary.totalTransactions)}</div>
          </div>
          <div className="stat-card">
            <h3>Total Barang Masuk</h3>
            <div className="value">{formatNumber(summary.stockIn)}</div>
          </div>
          <div className="stat-card">
            <h3>Total Barang Keluar</h3>
            <div className="value">{formatNumber(summary.stockOut)}</div>
          </div>
          <div className="stat-card">
            <h3>Selisih Arus Stok</h3>
            <div className="value">{formatNumber(summary.stockIn - summary.stockOut)}</div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2>Detail Transaksi</h2>
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
                  <th>Catatan</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td data-label="Kode">{transaction.transaction_code}</td>
                    <td data-label="Produk">{transaction.product?.name}</td>
                    <td data-label="Tipe">
                      <span className={`badge ${transaction.type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                        {transaction.type === 'in' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td data-label="Jumlah">
                      {formatNumber(transaction.quantity)} {transaction.product?.unit}
                    </td>
                    <td data-label="User">{transaction.user?.name || '-'}</td>
                    <td data-label="Catatan">{transaction.notes || '-'}</td>
                    <td data-label="Tanggal">{formatDate(transaction.transaction_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filteredTransactions.length && (
            <div className="dashboard-empty-state report-empty-state">
              Tidak ada transaksi pada filter laporan ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
