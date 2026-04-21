import React, { useEffect, useState } from 'react';
import api from '../api';
import Loading from './Loading';

/* eslint-disable react-hooks/exhaustive-deps */

const actionLabels = {
  create: 'Tambah',
  update: 'Ubah',
  delete: 'Hapus',
  login: 'Login',
  failed_login: 'Login Gagal',
};

const actionBadges = {
  create: 'badge-success',
  update: 'badge-warning',
  delete: 'badge-danger',
  login: 'badge-success',
  failed_login: 'badge-danger',
};

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    search: '',
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    const response = await api.get(`/audit-logs${params.toString() ? `?${params.toString()}` : ''}`);
    setLogs(response.data);
    setLoading(false);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Keamanan Sistem</span>
        <h1>Audit Log</h1>
        <p>Pantau perubahan data penting, login, dan aktivitas pengguna.</p>
      </div>

      <div className="table-container">
        <div className="table-header audit-header">
          <h2>Riwayat Aktivitas</h2>
          <form className="table-filters" onSubmit={handleFilterSubmit}>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Cari aktivitas"
            />
            <select
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            >
              <option value="">Semua Modul</option>
              <option value="auth">Auth</option>
              <option value="products">Produk</option>
              <option value="categories">Kategori</option>
              <option value="transactions">Transaksi</option>
              <option value="stock_opname">Stock Opname</option>
              <option value="users">User</option>
            </select>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            >
              <option value="">Semua Aksi</option>
              <option value="create">Tambah</option>
              <option value="update">Ubah</option>
              <option value="delete">Hapus</option>
              <option value="login">Login</option>
              <option value="failed_login">Login Gagal</option>
            </select>
            <button type="submit" className="btn btn-secondary">
              Terapkan
            </button>
          </form>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>User</th>
                <th>Aksi</th>
                <th>Modul</th>
                <th>Deskripsi</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td data-label="Waktu">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td data-label="User">{log.user?.name || '-'}</td>
                  <td data-label="Aksi">
                    <span className={`badge ${actionBadges[log.action] || 'badge-success'}`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td data-label="Modul">{log.module}</td>
                  <td data-label="Deskripsi">{log.description}</td>
                  <td data-label="Detail">
                    <details className="audit-details">
                      <summary>Lihat</summary>
                      <pre>{JSON.stringify({ sebelum: log.old_values, sesudah: log.new_values }, null, 2)}</pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
