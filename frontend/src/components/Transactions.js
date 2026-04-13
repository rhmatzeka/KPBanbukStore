import React, { useState, useEffect } from 'react';
import api from '../api';
import Loading from './Loading';

/* eslint-disable react-hooks/exhaustive-deps */

function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'in',
    quantity: 1,
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchTransactions(), fetchProducts()]);
    setLoading(false);
  };

  const fetchTransactions = async () => {
    const response = await api.get('/transactions');
    setTransactions(response.data);
  };

  const fetchProducts = async () => {
    const response = await api.get('/products');
    setProducts(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        ...formData,
        user_id: user.id
      });
      fetchTransactions();
      fetchProducts();
      closeModal();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    }
  };

  const openModal = () => {
    setFormData({
      product_id: '',
      type: 'in',
      quantity: 1,
      notes: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Arus Barang</span>
        <h1>Transaksi</h1>
        <p>Kelola transaksi barang masuk dan keluar</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Daftar Transaksi</h2>
          <button type="button" className="btn btn-primary" onClick={openModal}>
            + Tambah Transaksi
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
              <th>Catatan</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trx) => (
              <tr key={trx.id}>
                <td data-label="Kode">{trx.transaction_code}</td>
                <td data-label="Produk">{trx.product?.name}</td>
                <td data-label="Tipe">
                  <span className={`badge ${trx.type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                    {trx.type === 'in' ? 'Masuk' : 'Keluar'}
                  </span>
                </td>
                <td data-label="Jumlah">{trx.quantity} {trx.product?.unit}</td>
                <td data-label="User">{trx.user?.name}</td>
                <td data-label="Catatan">{trx.notes || '-'}</td>
                <td data-label="Tanggal">{new Date(trx.transaction_date).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Tambah Transaksi</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Produk</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  required
                >
                  <option value="">Pilih Produk</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stok: {product.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tipe Transaksi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="in">Barang Masuk</option>
                  <option value="out">Barang Keluar</option>
                </select>
              </div>
              <div className="form-group">
                <label>Jumlah</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal</label>
                <input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Catatan</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Opsional"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
