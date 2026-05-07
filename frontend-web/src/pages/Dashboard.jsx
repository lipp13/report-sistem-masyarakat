import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import ReportCard from '../components/ReportCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', category_id: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const canSeeModerationStatuses = user?.role === 'admin' || user?.role === 'super_admin';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 9, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);

      const [rRes, cRes, sRes] = await Promise.all([
        api.get('/reports', { params }),
        api.get('/categories'),
        api.get('/reports/stats'),
      ]);
      setReports(rRes.data.data);
      setPagination(rRes.data.pagination);
      setCategories(cRes.data.data);
      setStats(sRes.data.data);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput }));
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleFilter = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPagination((p) => ({ ...p, page: 1 }));
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {/* Hero Stats */}
        <section className="stats-section">
          <div className="stats-header">
            <div>
              <h1 className="page-title">Dashboard Laporan</h1>
              <p className="page-subtitle">Pantau dan kelola pengaduan masyarakat</p>
            </div>
            {user?.role === 'user' ? (
              <Link to="/reports/new" className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Buat Laporan
              </Link>
            ) : (
              <button className="btn-secondary" disabled title="Admin/Super Admin tidak dapat membuat laporan">
                Buat Laporan
              </button>
            )}
          </div>
          {stats && (
            <div className="stats-grid">
              <div className="stat-card stat-total">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <span className="stat-num">{stats.total}</span>
                  <span className="stat-label">Total Laporan</span>
                </div>
              </div>
              {canSeeModerationStatuses && (
                <div className="stat-card stat-pending">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <span className="stat-num">{stats.pending}</span>
                    <span className="stat-label">Menunggu</span>
                  </div>
                </div>
              )}
              <div className="stat-card stat-approved">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <span className="stat-num">{stats.approved}</span>
                  <span className="stat-label">Disetujui</span>
                </div>
              </div>
              {canSeeModerationStatuses && (
                <div className="stat-card stat-rejected">
                  <div className="stat-icon">❌</div>
                  <div className="stat-info">
                    <span className="stat-num">{stats.rejected}</span>
                    <span className="stat-label">Ditolak</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="filters-section">
          <form className="search-bar" onSubmit={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Cari laporan..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            <button type="submit">Cari</button>
          </form>

          <div className="filter-chips">
            <button className={`chip ${!filters.status ? 'chip-active' : ''}`} onClick={() => handleFilter('status', '')}>Semua</button>
            {canSeeModerationStatuses && (
              <button className={`chip ${filters.status === 'pending' ? 'chip-active' : ''}`} onClick={() => handleFilter('status', 'pending')}>⏳ Menunggu</button>
            )}
            <button className={`chip ${filters.status === 'approved' ? 'chip-active' : ''}`} onClick={() => handleFilter('status', 'approved')}>✅ Disetujui</button>
            {canSeeModerationStatuses && (
              <button className={`chip ${filters.status === 'rejected' ? 'chip-active' : ''}`} onClick={() => handleFilter('status', 'rejected')}>❌ Ditolak</button>
            )}
          </div>

          <div className="filter-chips">
            <button className={`chip chip-sm ${!filters.category_id ? 'chip-active' : ''}`} onClick={() => handleFilter('category_id', '')}>Semua Kategori</button>
            {categories.map((c) => (
              <button key={c.id} className={`chip chip-sm ${filters.category_id == c.id ? 'chip-active' : ''}`} onClick={() => handleFilter('category_id', c.id)}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </section>

        {/* Reports Grid */}
        <section className="reports-section">
          {loading ? (
            <div className="loading-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card"></div>)}
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Belum ada laporan</h3>
              <p>Jadilah yang pertama melaporkan!</p>
              {user?.role === 'user' ? (
                <Link to="/reports/new" className="btn-primary">Buat Laporan Pertama</Link>
              ) : (
                <span className="page-subtitle">Hanya role user yang bisa membuat laporan.</span>
              )}
            </div>
          ) : (
            <>
              <div className="reports-grid">
                {reports.map((r) => <ReportCard key={r.id} report={r} />)}
              </div>
              {pagination.total_pages > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>← Prev</button>
                  <span className="page-info">Halaman {pagination.page} dari {pagination.total_pages}</span>
                  <button className="page-btn" disabled={pagination.page === pagination.total_pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next →</button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
