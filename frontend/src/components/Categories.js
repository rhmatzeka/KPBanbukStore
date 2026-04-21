import React, { useState, useEffect } from 'react';
import api from '../api';
import Loading from './Loading';
import ConfirmDialog from './ConfirmDialog';

function Categories({ user }) {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const response = await api.get('/categories');
    setCategories(response.data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      fetchCategories();
      closeModal();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
      setConfirmDialog({ isOpen: false, categoryId: null, categoryName: '' });
    } catch (error) {
      alert('Tidak bisa menghapus kategori yang masih memiliki produk');
      setConfirmDialog({ isOpen: false, categoryId: null, categoryName: '' });
    }
  };

  const openDeleteConfirm = (category) => {
    setConfirmDialog({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name
    });
  };

  const closeDeleteConfirm = () => {
    setConfirmDialog({ isOpen: false, categoryId: null, categoryName: '' });
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  if (loading) {
    return <Loading />;
  }

  const canDelete = user?.role?.name === 'owner';

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Master Data</span>
        <h1>Kategori</h1>
        <p>Kelola kategori produk</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Daftar Kategori</h2>
          <button type="button" className="btn btn-primary" onClick={() => openModal()}>
            + Tambah Kategori
          </button>
        </div>
        <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Deskripsi</th>
              <th>Jumlah Produk</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td data-label="Nama">{category.name}</td>
                <td data-label="Deskripsi">{category.description || '-'}</td>
                <td data-label="Jumlah Produk">{category.products_count || 0}</td>
                <td data-label="Aksi" className="action-cell">
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => openModal(category)}>
                    Edit
                  </button>
                  {canDelete && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => openDeleteConfirm(category)}>
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
            <h2>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Kategori</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${confirmDialog.categoryName}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => handleDelete(confirmDialog.categoryId)}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
}

export default Categories;
