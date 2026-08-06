import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPagination, setUserPagination] = useState({ page: 1, total_pages: 1 });
  const [reportPagination, setReportPagination] = useState({ page: 1, total_pages: 1 });
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '📋', color: '#6366f1' });
  const [editingUser, setEditingUser] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports', { params: { page: reportPagination.page, limit: 10 } });
      setReports(res.data.data);
      setReportPagination(res.data.pagination);
    } catch {
      toast.error('Gagal memuat daftar laporan');
    } finally {
      setLoading(false);
    }
  }, [reportPagination.page]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { page: userPagination.page, limit: 10 } });
      setUsers(res.data.data);
      setUserPagination(res.data.pagination);
    } catch (err) {
      if (err.response?.status !== 403) toast.error('Gagal memuat daftar pengguna');
    } finally {
      setLoading(false);
    }
  }, [userPagination.page]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch {
      toast.error('Gagal memuat kategori');
    }
  }, []);

  useEffect(() => {
    if (tab === 'reports') fetchReports();
    if (tab === 'users') fetchUsers();
    if (tab === 'categories') fetchCategories();
  }, [tab, fetchReports, fetchUsers, fetchCategories]);

  const handleStatusChange = async (reportId, status) => {
    try {
      await api.patch(`/reports/${reportId}/status`, { status });
      toast.success('Status laporan berhasil diperbarui!');
      fetchReports();
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleDeleteReport = async (id) => {
    if (!confirm('Hapus laporan ini secara permanen?')) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Laporan berhasil dihapus');
      fetchReports();
    } catch {
      toast.error('Gagal menghapus laporan');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', newCategory);
      toast.success('Kategori baru berhasil ditambahkan');
      setNewCategory({ name: '', description: '', icon: '📋', color: '#6366f1' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan kategori');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
    } catch {
      toast.error('Gagal menghapus kategori');
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await api.put(`/users/${userId}`, { role });
      toast.success('Role pengguna berhasil diperbarui');
      fetchUsers();
      setEditingUser(null);
    } catch {
      toast.error('Gagal memperbarui role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Hapus pengguna ini secara permanen?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Pengguna berhasil dihapus');
      fetchUsers();
    } catch {
      toast.error('Gagal menghapus pengguna');
    }
  };

  const handleToggleActive = async (targetUser) => {
    try {
      await api.put(`/users/${targetUser.id}`, { is_active: !targetUser.is_active });
      toast.success(`Pengguna ${!targetUser.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchUsers();
    } catch {
      toast.error('Gagal memperbarui status pengguna');
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="admin-page">
          <div className="admin-header">
            <h1 className="page-title">⚙️ Panel Moderasi & Administrasi</h1>
            <p className="page-subtitle">Kelola pengaduan, respon petugas, kategori, dan pengguna sistem</p>
          </div>

          <div className="tab-bar">
            <button className={`tab-btn ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>📋 Daftar Laporan</button>
            {user?.role === 'super_admin' && (
              <button className={`tab-btn ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>🏷️ Kelola Kategori</button>
            )}
            {user?.role === 'super_admin' && (
              <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Manajemen Pengguna</button>
            )}
          </div>

          {loading && (
            <div className="loading-screen" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="spinner"></div>
            </div>
          )}

          {/* REPORTS TAB */}
          {!loading && tab === 'reports' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Laporan</th>
                    <th>Kategori</th>
                    <th>Pelapor</th>
                    <th>Tanggal</th>
                    <th>Dukungan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td data-label="Laporan">
                        <Link to={`/reports/${r.id}`} className="table-link" style={{ fontWeight: 600 }}>
                          {r.title}
                        </Link>
                      </td>
                      <td data-label="Kategori">
                        <span className="table-category">
                          {r.category?.icon} {r.category?.name}
                        </span>
                      </td>
                      <td data-label="Pelapor">{r.user?.name || 'Warga'}</td>
                      <td data-label="Tanggal">{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                      <td data-label="Dukungan">👍 {r.votes_count || 0}</td>
                      <td data-label="Status">
                        <select
                          className="status-select"
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        >
                          <option value="pending">⏳ Menunggu</option>
                          <option value="in_progress">⚡ Diproses</option>
                          <option value="resolved">✅ Selesai</option>
                          <option value="rejected">❌ Ditolak</option>
                        </select>
                      </td>
                      <td data-label="Aksi">
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Link to={`/reports/${r.id}`} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Detail</Link>
                          <button className="btn-danger-xs" onClick={() => handleDeleteReport(r.id)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {reportPagination.total_pages > 1 && (
                <div className="pagination" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                  <button className="page-btn" disabled={reportPagination.page === 1} onClick={() => setReportPagination((p) => ({ ...p, page: p.page - 1 }))}>← Prev</button>
                  <span className="page-info">{reportPagination.page} / {reportPagination.total_pages}</span>
                  <button className="page-btn" disabled={reportPagination.page === reportPagination.total_pages} onClick={() => setReportPagination((p) => ({ ...p, page: p.page + 1 }))}>Next →</button>
                </div>
              )}
            </div>
          )}

          {/* CATEGORIES TAB */}
          {!loading && tab === 'categories' && user?.role === 'super_admin' && (
            <div className="admin-categories">
              <form className="category-form" onSubmit={handleCreateCategory} style={{ marginBottom: '2rem' }}>
                <h3>Tambah Kategori Baru</h3>
                <div className="category-form-grid">
                  <input className="form-input" placeholder="Nama Kategori" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
                  <input className="form-input" placeholder="Icon (Emoji misal: 🏗️)" value={newCategory.icon} onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} />
                  <input type="color" className="form-color" value={newCategory.color} onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })} />
                  <input className="form-input" placeholder="Deskripsi Singkat" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '0.75rem' }}>+ Tambah Kategori</button>
              </form>

              <div className="categories-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {categories.map((c) => (
                  <div key={c.id} className="category-item" style={{ borderLeft: `4px solid ${c.color}`, background: 'var(--lm-surface0)', padding: '1rem', borderRadius: 'var(--lm-radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="cat-icon-lg" style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                      <div className="cat-info">
                        <strong style={{ display: 'block', color: 'var(--lm-text)' }}>{c.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--lm-subtext0)' }}>{c.description}</span>
                      </div>
                    </div>
                    <button className="btn-danger-xs" onClick={() => handleDeleteCategory(c.id)}>Hapus</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {!loading && tab === 'users' && user?.role === 'super_admin' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pengguna</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Bergabung</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td data-label="Pengguna">
                        <div className="user-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="user-avatar-sm" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--lm-mauve)', color: '#111', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {u.name?.charAt(0)}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Role">
                        {editingUser === u.id ? (
                          <select className="status-select" defaultValue={u.role} onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="super_admin">super_admin</option>
                          </select>
                        ) : (
                          <span className={`role-badge role-${u.role}`} onClick={() => setEditingUser(u.id)} style={{ cursor: 'pointer' }} title="Klik untuk ubah role">
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td data-label="Status">
                        <button className={`toggle-btn ${u.is_active ? 'active' : 'inactive'}`} onClick={() => handleToggleActive(u)}>
                          {u.is_active ? '✅ Aktif' : '⛔ Nonaktif'}
                        </button>
                      </td>
                      <td data-label="Bergabung">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                      <td data-label="Aksi">
                        <button className="btn-danger-xs" onClick={() => handleDeleteUser(u.id)}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
