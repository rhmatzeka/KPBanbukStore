import React, { useState, useEffect } from 'react';
import api from '../api';
import Loading from './Loading';
import ConfirmDialog from './ConfirmDialog';

/* eslint-disable react-hooks/exhaustive-deps */

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
    userName: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: ''
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchRoles()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const response = await api.get('/users');
    setUsers(response.data);
  };

  const fetchRoles = async () => {
    const response = await api.get('/roles');
    setRoles(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      fetchUsers();
      closeModal();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/users/${id}`);
    fetchUsers();
    setConfirmDialog({ isOpen: false, userId: null, userName: '' });
  };

  const openDeleteConfirm = (userData) => {
    setConfirmDialog({
      isOpen: true,
      userId: userData.id,
      userName: userData.name
    });
  };

  const closeDeleteConfirm = () => {
    setConfirmDialog({ isOpen: false, userId: null, userName: '' });
  };

  const openModal = (userData = null) => {
    if (userData) {
      setEditingUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        password: '',
        role_id: userData.role_id
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role_id: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Hak Akses Sistem</span>
        <h1>Kelola User</h1>
        <p>Manajemen pengguna sistem</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Daftar User</h2>
          <button type="button" className="btn btn-primary" onClick={() => openModal()}>
            + Tambah User
          </button>
        </div>
        <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td data-label="Nama">{u.name}</td>
                <td data-label="Email">{u.email}</td>
                <td data-label="Role">
                  <span className="badge badge-success">
                    {u.role?.display_name}
                  </span>
                </td>
                <td data-label="Aksi" className="action-cell">
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => openModal(u)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => openDeleteConfirm(u)}>
                    Hapus
                  </button>
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
            <h2>{editingUser ? 'Edit User' : 'Tambah User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password {editingUser && '(kosongkan jika tidak diubah)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                  required
                >
                  <option value="">Pilih Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.display_name}</option>
                  ))}
                </select>
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
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus user "${confirmDialog.userName}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => handleDelete(confirmDialog.userId)}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
}

export default Users;
