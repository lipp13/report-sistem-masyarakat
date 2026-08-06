import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import ReportCard from '../components/ReportCard';
import ReportsMap from '../components/ReportsMap';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, LayoutGrid, Map, Filter, ArrowUpDown } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', category_id: '', search: '', sort: 'latest' });
  const [searchInput, setSearchInput] = useState('');

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
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        {/* Header & Stats Banner */}
        <section className="stats-section">
          <div className="stats-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h1 className="page-title">Dashboard Pengaduan</h1>
              <p className="page-subtitle">Pantau dan partisipasi dalam penanganan fasilitas publik</p>
            </div>
            <Link to="/reports/new" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} />
              <span>Buat Laporan Baru</span>
            </Link>
          </div>

          {stats && (
            <div className="stats-grid">
              <div className="stat-card stat-total">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <span className="stat-num">{stats.total || 0}</span>
                  <span className="stat-label">Total Pengaduan</span>
                </div>
              </div>
              <div className="stat-card stat-pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <span className="stat-num">{stats.pending || 0}</span>
                  <span className="stat-label">Menunggu</span>
                </div>
              </div>
              <div className="stat-card" style={{ background: 'rgba(148, 226, 213, 0.1)', border: '1px solid rgba(148, 226, 213, 0.3)' }}>
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <span className="stat-num" style={{ color: 'var(--lm-teal)' }}>{stats.in_progress || 0}</span>
                  <span className="stat-label">Sedang Diproses</span>
                </div>
              </div>
              <div className="stat-card stat-approved">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <span className="stat-num">{stats.completed || stats.resolved || 0}</span>
                  <span className="stat-label">Selesai Ditangani</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Filters & View Switcher */}
        <section className="filters-section" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <form className="search-bar" onSubmit={handleSearch} style={{ flex: 1, minWidth: '260px' }}>
              <Search size={18} color="var(--lm-overlay)" />
              <input
                type="text"
                placeholder="Cari kata kunci, judul, atau lokasi..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit">Cari</button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Sort selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--lm-surface0)', padding: '0.4rem 0.75rem', borderRadius: 'var(--lm-radius-sm)', border: '1px solid var(--lm-surface1)' }}>
                <ArrowUpDown size={14} color="var(--lm-subtext0)" />
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilter('sort', e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--lm-text)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="latest" style={{ background: '#1e1e2e' }}>Terbaru</option>
                  <option value="popular" style={{ background: '#1e1e2e' }}>Terpopuler (Banyak Suara)</option>
                  <option value="oldest" style={{ background: '#1e1e2e' }}>Terlama</option>
                </select>
              </div>

              {/* View mode toggle */}
              <div style={{ display: 'flex', background: 'var(--lm-surface0)', padding: '0.2rem', borderRadius: 'var(--lm-radius-sm)', border: '1px solid var(--lm-surface1)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    border: 'none',
                    borderRadius: 'var(--lm-radius-sm)',
                    background: viewMode === 'grid' ? 'var(--lm-surface1)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--lm-blue)' : 'var(--lm-subtext0)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <LayoutGrid size={16} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    border: 'none',
                    borderRadius: 'var(--lm-radius-sm)',
                    background: viewMode === 'map' ? 'var(--lm-surface1)' : 'transparent',
                    color: viewMode === 'map' ? 'var(--lm-blue)' : 'var(--lm-subtext0)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <Map size={16} /> Peta Peta
                </button>
              </div>
            </div>
          </div>

          {/* Filter Status Chips */}
          <div className="filter-chips" style={{ marginBottom: '0.75rem' }}>
            <button className={`chip ${!filters.status ? 'chip-active' : ''}`} onClick={() => handleFilter('status', '')}>Semua Status</button>
            <button className={`chip ${filters.status === 'pending' ? 'chip-active' : ''}`} onClick={() => handleFilter('status', 'pending')}>⏳ Menunggu</button>
            <button className={`chip ${filters.status === 'in_progress' ? 'chip-active' : ''}`} onClick={() => handleFilter('status', 'in_progress')}>⚡ Diproses</button>
            <button className={`chip ${filters.status === 'resolved' ? 'chip-active' : ''}`} onClick={() => handleFilter('status', 'resolved')}>✅ Selesai</button>
            <button className={`chip ${filters.status === 'rejected' ? 'chip-active' : ''}`} onClick={() => handleFilter('status', 'rejected')}>❌ Ditolak</button>
          </div>

          {/* Filter Category Chips */}
          <div className="filter-chips">
            <button className={`chip chip-sm ${!filters.category_id ? 'chip-active' : ''}`} onClick={() => handleFilter('category_id', '')}>Semua Kategori</button>
            {categories.map((c) => (
              <button key={c.id} className={`chip chip-sm ${filters.category_id == c.id ? 'chip-active' : ''}`} onClick={() => handleFilter('category_id', c.id)}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </section>

        {/* Content Section: Grid or Map */}
        <section className="reports-section" style={{ marginTop: '1.5rem' }}>
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-card" style={{ height: '300px', borderRadius: 'var(--lm-radius)' }}></div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--lm-surface0)', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)' }}>
              <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3>Belum ada laporan yang sesuai</h3>
              <p style={{ color: 'var(--lm-subtext0)', marginBottom: '1.5rem' }}>Coba ubah kata kunci pencarian atau filter yang Anda pilih.</p>
              <Link to="/reports/new" className="btn-primary">Buat Laporan Baru</Link>
            </div>
          ) : viewMode === 'map' ? (
            <ReportsMap reports={reports} />
          ) : (
            <>
              <div className="reports-grid">
                {reports.map((r) => (
                  <ReportCard key={r.id} report={r} onVoteSuccess={fetchData} />
                ))}
              </div>

              {pagination.total_pages > 1 && (
                <div className="pagination" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                  <button className="page-btn" disabled={pagination.page === 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>← Sebelum</button>
                  <span className="page-info">Halaman {pagination.page} dari {pagination.total_pages}</span>
                  <button className="page-btn" disabled={pagination.page === pagination.total_pages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>Selanjutnya →</button>
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
