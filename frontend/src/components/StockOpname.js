import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import Loading from './Loading';

/* eslint-disable react-hooks/exhaustive-deps */

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value || 0);

function StockOpname() {
  const [opnames, setOpnames] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    product_id: '',
    physical_stock: 0,
    reason: '',
    opname_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchOpnames(), fetchProducts()]);
    setLoading(false);
  };

  const fetchOpnames = async () => {
    const response = await api.get('/stock-opnames');
    setOpnames(response.data);
  };

  const fetchProducts = async () => {
    const response = await api.get('/products');
    setProducts(response.data);
  };

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(formData.product_id)),
    [products, formData.product_id]
  );

  const stockDifference = selectedProduct
    ? parseInt(formData.physical_stock || 0, 10) - parseInt(selectedProduct.stock || 0, 10)
    : 0;

  const openModal = () => {
    setFormData({
      product_id: '',
      physical_stock: 0,
      reason: '',
      opname_date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleProductChange = (productId) => {
    const product = products.find((item) => String(item.id) === String(productId));

    setFormData({
      ...formData,
      product_id: productId,
      physical_stock: product?.stock || 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/stock-opnames', formData);
      await fetchData();
      closeModal();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Penyesuaian Stok</span>
        <h1>Stock Opname</h1>
        <p>Sesuaikan stok sistem dengan hasil hitung fisik gudang dan simpan riwayatnya.</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Riwayat Stock Opname</h2>
          <button type="button" className="btn btn-primary" onClick={openModal}>
            + Stock Opname
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Produk</th>
                <th>Stok Sistem</th>
                <th>Stok Fisik</th>
                <th>Selisih</th>
                <th>Petugas</th>
                <th>Alasan</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {opnames.map((opname) => (
                <tr key={opname.id}>
                  <td data-label="Kode">{opname.opname_code}</td>
                  <td data-label="Produk">{opname.product?.name}</td>
                  <td data-label="Stok Sistem">{formatNumber(opname.system_stock)}</td>
                  <td data-label="Stok Fisik">{formatNumber(opname.physical_stock)}</td>
                  <td data-label="Selisih">
                    <span className={`badge ${opname.difference < 0 ? 'badge-danger' : 'badge-success'}`}>
                      {opname.difference > 0 ? '+' : ''}{formatNumber(opname.difference)}
                    </span>
                  </td>
                  <td data-label="Petugas">{opname.user?.name || '-'}</td>
                  <td data-label="Alasan">{opname.reason}</td>
                  <td data-label="Tanggal">{new Date(opname.opname_date).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Input Stock Opname</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Produk</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                >
                  <option value="">Pilih Produk</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Stok sistem: {product.stock} {product.unit}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="stock-preview">
                  <div>
                    <span>Stok Sistem</span>
                    <strong>{formatNumber(selectedProduct.stock)} {selectedProduct.unit}</strong>
                  </div>
                  <div>
                    <span>Selisih</span>
                    <strong className={stockDifference < 0 ? 'text-danger' : 'text-success'}>
                      {stockDifference > 0 ? '+' : ''}{formatNumber(stockDifference)}
                    </strong>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Stok Fisik</label>
                <input
                  type="number"
                  value={formData.physical_stock}
                  onChange={(e) => setFormData({ ...formData, physical_stock: e.target.value })}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tanggal Opname</label>
                <input
                  type="date"
                  value={formData.opname_date}
                  onChange={(e) => setFormData({ ...formData, opname_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Alasan Penyesuaian</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Contoh: hasil hitung fisik gudang"
                  required
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

export default StockOpname;
