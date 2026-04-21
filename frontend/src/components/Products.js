import React, { useState, useEffect } from 'react';
import api from '../api';
import Loading from './Loading';
import ConfirmDialog from './ConfirmDialog';

/* eslint-disable react-hooks/exhaustive-deps */

function Products({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  });
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_id: '',
    stock: 0,
    min_stock: 10,
    price: 0,
    unit: 'pcs',
    description: ''
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchCategories()]);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const response = await api.get('/products');
    setProducts(response.data);
  };

  const fetchCategories = async () => {
    const response = await api.get('/categories');
    setCategories(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/products/${id}`);
    fetchProducts();
    setConfirmDialog({ isOpen: false, productId: null, productName: '' });
  };

  const openDeleteConfirm = (product) => {
    setConfirmDialog({
      isOpen: true,
      productId: product.id,
      productName: product.name
    });
  };

  const closeDeleteConfirm = () => {
    setConfirmDialog({ isOpen: false, productId: null, productName: '' });
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        code: '',
        name: '',
        category_id: '',
        stock: 0,
        min_stock: 10,
        price: 0,
        unit: 'pcs',
        description: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  if (loading) {
    return <Loading />;
  }

  const canDelete = user?.role?.name === 'owner';

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Inventaris Barang</span>
        <h1>Produk</h1>
        <p>Kelola data produk gudang</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Daftar Produk</h2>
          <button type="button" className="btn btn-primary" onClick={() => openModal()}>
            + Tambah Produk
          </button>
        </div>
        <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Stok</th>
              <th>Min Stok</th>
              <th>Harga</th>
              <th>Satuan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td data-label="Kode">{product.code}</td>
                <td data-label="Nama">{product.name}</td>
                <td data-label="Kategori">{product.category?.name}</td>
                <td data-label="Stok">
                  <span className={`badge ${product.stock <= product.min_stock ? 'badge-danger' : 'badge-stock-ok'}`}>
                    {product.stock}
                  </span>
                </td>
                <td data-label="Min Stok">{product.min_stock}</td>
                <td data-label="Harga">Rp {parseInt(product.price, 10).toLocaleString('id-ID')}</td>
                <td data-label="Satuan">{product.unit}</td>
                <td data-label="Aksi" className="action-cell">
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => openModal(product)}>
                    Edit
                  </button>
                  {canDelete && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => openDeleteConfirm(product)}>
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Kode Produk</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nama Produk</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Stok</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Minimal Stok</label>
                <input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Harga</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Satuan</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Deskripsi</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${confirmDialog.productName}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => handleDelete(confirmDialog.productId)}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
}

export default Products;
