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
    } catch { toast.error('Gagal memuat laporan'); }
    finally { setLoading(false); }
  }, [reportPagination.page]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { page: userPagination.page, limit: 10 } });
      setUsers(res.data.data);
      setUserPagination(res.data.pagination);
    } catch (err) {
      if (err.response?.status !== 403) toast.error('Gagal memuat user');
    } finally { setLoading(false); }
  }, [userPagination.page]);

  const fetchCategories = useCallback(async () => {
    const res = await api.get('/categories');
    setCategories(res.data.data);
  }, []);

  useEffect(() => {
    if (tab === 'reports') fetchReports();
    if (tab === 'users') fetchUsers();
    if (tab === 'categories') fetchCategories();
  }, [tab, fetchReports, fetchUsers, fetchCategories]);

  const handleStatusChange = async (reportId, status) => {
    try {
      await api.patch(`/reports/${reportId}/status`, { status });
      toast.success('Status diperbarui');
      fetchReports();
    } catch { toast.error('Gagal update status'); }
  };

  const handleDeleteReport = async (id) => {
    if (!confirm('Hapus laporan ini?')) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Laporan dihapus');
      fetchReports();
    } catch { toast.error('Gagal hapus laporan'); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', newCategory);
      toast.success('Kategori ditambahkan');
      setNewCategory({ name: '', description: '', icon: '📋', color: '#6366f1' });
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal tambah kategori'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Kategori dihapus');
      fetchCategories();
    } catch { toast.error('Gagal hapus kategori'); }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await api.put(`/users/${userId}`, { role });
      toast.success('Role diperbarui');
      fetchUsers();
      setEditingUser(null);
    } catch { toast.error('Gagal update role'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User dihapus');
      fetchUsers();
    } catch { toast.error('Gagal hapus user'); }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { is_active: !user.is_active });
      toast.success(`User ${!user.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchUsers();
    } catch { toast.error('Gagal update status user'); }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="admin-page">
          <div className="admin-header">
            <h1 className="page-title">⚙️ Admin Panel</h1>
            <p className="page-subtitle">Kelola laporan, kategori, dan pengguna</p>
          </div>

          <div className="tab-bar">
            <button className={`tab-btn ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>📋 Laporan</button>
            {user?.role === 'super_admin' && (
              <button className={`tab-btn ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>🏷️ Kategori</button>
            )}
            {user?.role === 'super_admin' && (
              <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Pengguna</button>
            )}
          </div>

          {loading && <div className="loading-screen"><div className="spinner"></div></div>}

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
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td><Link to={`/reports/${r.id}`} className="table-link">{r.title}</Link></td>
                      <td><span className="table-category">{r.category?.icon} {r.category?.name}</span></td>
                      <td>{r.user?.name}</td>
                      <td>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                      <td>
                        <select
                          className="status-select"
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        >
                          <option value="pending">⏳ Menunggu</option>
                          <option value="approved">✅ Disetujui</option>
                          <option value="rejected">❌ Ditolak</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn-danger-xs" onClick={() => handleDeleteReport(r.id)}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportPagination.total_pages > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={reportPagination.page === 1} onClick={() => setReportPagination(p => ({ ...p, page: p.page - 1 }))}>← Prev</button>
                  <span className="page-info">{reportPagination.page} / {reportPagination.total_pages}</span>
                  <button className="page-btn" disabled={reportPagination.page === reportPagination.total_pages} onClick={() => setReportPagination(p => ({ ...p, page: p.page + 1 }))}>Next →</button>
                </div>
              )}
            </div>
          )}

          {/* CATEGORIES TAB */}
          {!loading && tab === 'categories' && user?.role === 'super_admin' && (
            <div className="admin-categories">
              <form className="category-form" onSubmit={handleCreateCategory}>
                <h3>Tambah Kategori Baru</h3>
                <div className="category-form-grid">
                  <input className="form-input" placeholder="Nama kategori" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
                  <input className="form-input" placeholder="Icon (emoji)" value={newCategory.icon} onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} />
                  <input type="color" className="form-color" value={newCategory.color} onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })} />
                  <input className="form-input" placeholder="Deskripsi" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary">+ Tambah Kategori</button>
              </form>

              <div className="categories-list">
                {categories.map((c) => (
                  <div key={c.id} className="category-item" style={{ borderLeft: `4px solid ${c.color}` }}>
                    <span className="cat-icon-lg">{c.icon}</span>
                    <div className="cat-info">
                      <strong>{c.name}</strong>
                      <span>{c.description}</span>
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
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm">{u.name?.charAt(0)}</div>
                          {u.name}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {editingUser === u.id ? (
                          <select className="status-select" defaultValue={u.role} onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="super_admin">super_admin</option>
                          </select>
                        ) : (
                          <span className={`role-badge role-${u.role}`} onClick={() => setEditingUser(u.id)} style={{ cursor: 'pointer' }}>{u.role}</span>
                        )}
                      </td>
                      <td>
                        <button className={`toggle-btn ${u.is_active ? 'active' : 'inactive'}`} onClick={() => handleToggleActive(u)}>
                          {u.is_active ? '✅ Aktif' : '⛔ Nonaktif'}
                        </button>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                      <td>
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
