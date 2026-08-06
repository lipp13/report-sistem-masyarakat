import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import LeafletMapView from "../components/LeafletMapView";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ThumbsUp, ArrowLeft, Trash2, MapPin, Calendar, User as UserIcon, MessageSquare, ZoomIn, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

function parseCoord(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const ReportDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [voting, setVoting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const commentsEndRef = useRef(null);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/reports/${id}`);
      setReport(res.data.data);
    } catch {
      toast.error("Laporan tidak ditemukan.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleVote = async () => {
    if (!user) {
      toast.error("Silakan login untuk mendukung laporan ini.");
      return;
    }
    if (voting) return;
    setVoting(true);
    try {
      const res = await api.post(`/reports/${id}/vote`);
      if (res.data?.success) {
        setReport((prev) => ({
          ...prev,
          votes_count: res.data.data.votes_count,
          has_voted: res.data.data.has_voted,
        }));
        toast.success(res.data.message);
      }
    } catch {
      toast.error("Gagal memproses dukungan.");
    } finally {
      setVoting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/reports/${id}/comments`, { content: comment });
      setComment("");
      fetchReport();
      setTimeout(
        () => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        200
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambah komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Hapus komentar ini?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      fetchReport();
      toast.success("Komentar dihapus.");
    } catch {
      toast.error("Gagal menghapus komentar.");
    }
  };

  const handleDeleteReport = async () => {
    if (!confirm("Hapus laporan ini secara permanen?")) return;
    setDeleting(true);
    try {
      await api.delete(`/reports/${id}`);
      toast.success("Laporan berhasil dihapus.");
      navigate("/dashboard");
    } catch {
      toast.error("Gagal menghapus laporan.");
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="loading-screen" style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <div className="spinner"></div>
          </div>
        </main>
      </div>
    );

  if (!report) return null;

  const canManage =
    user &&
    (user.id === report.user_id || ["admin", "super_admin"].includes(user.role));
  const isAdmin = user && ["admin", "super_admin"].includes(user.role);

  const lat = parseCoord(report.latitude);
  const lng = parseCoord(report.longitude);
  const hasCoords = lat !== null && lng !== null;
  const showLocationSection = Boolean(report.location || hasCoords);

  // Status timeline steps computation
  const getTimelineSteps = () => {
    const isRejected = report.status === 'rejected';
    const isResolved = report.status === 'resolved' || report.status === 'approved';
    const isInProgress = report.status === 'in_progress' || isResolved;

    return [
      { label: 'Laporan Dibuat', completed: true, active: false, icon: '📝' },
      { label: 'Verifikasi', completed: true, active: report.status === 'pending', icon: '🔍' },
      { label: 'Penanganan', completed: isInProgress, active: report.status === 'in_progress', icon: '⚡' },
      { label: isRejected ? 'Ditolak' : 'Selesai', completed: isResolved, active: isResolved || isRejected, icon: isRejected ? '❌' : '✅' },
    ];
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="detail-page">
          {/* Header Navigation */}
          <div className="detail-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </button>
            {canManage && (
              <div className="detail-actions">
                <button className="btn-danger-sm" onClick={handleDeleteReport} disabled={deleting} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trash2 size={15} />
                  <span>{deleting ? "Menghapus..." : "Hapus Laporan"}</span>
                </button>
              </div>
            )}
          </div>

          <div className="detail-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.75rem' }}>
            <div className="detail-main">
              {/* Image Preview with Lightbox trigger */}
              {report.image_url && (
                <div
                  className="detail-image-wrap"
                  onClick={() => setLightboxOpen(true)}
                  style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: 'var(--lm-radius-lg)', marginBottom: '1.5rem' }}
                >
                  <img
                    src={`${API_URL}${report.image_url}`}
                    alt={report.title}
                    className="detail-image"
                    style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: 'var(--lm-radius-sm)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ZoomIn size={14} /> Klik untuk perbesar
                  </div>
                </div>
              )}

              {/* Status Timeline Stepper */}
              <div style={{ background: 'var(--lm-surface0)', padding: '1.25rem', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--lm-subtext0)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Alur Penanganan Laporan
                </h4>
                <div className="timeline-stepper">
                  {getTimelineSteps().map((step, idx) => (
                    <div key={idx} className={`timeline-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                      <div className="timeline-icon">{step.icon}</div>
                      <span className="timeline-label">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Category & Upvote */}
              <div className="detail-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    className="detail-category"
                    style={{
                      backgroundColor: (report.category?.color || '#3b82f6') + '20',
                      color: report.category?.color || '#3b82f6',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--lm-radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    {report.category?.icon} {report.category?.name}
                  </span>
                  <StatusBadge status={report.status} size="md" />
                </div>

                <button
                  onClick={handleVote}
                  className={`btn-vote ${report.has_voted ? 'voted' : ''}`}
                  style={{ padding: '0.45rem 1rem', fontSize: '0.9rem' }}
                >
                  <ThumbsUp size={16} className="vote-icon" />
                  <span>{report.has_voted ? 'Ditemukan Dukungan' : 'Dukung Laporan (+1)'}</span>
                  <strong style={{ marginLeft: '4px' }}>({report.votes_count || 0})</strong>
                </button>
              </div>

              <h1 className="detail-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0 1rem', lineHeight: 1.3 }}>
                {report.title}
              </h1>

              {/* Author & Timestamp Bar */}
              <div className="detail-info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--lm-surface0)', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)', marginBottom: '1.5rem' }}>
                <div className="detail-author" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="author-avatar-lg" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--lm-mauve), var(--lm-blue))', color: '#111', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {report.user?.name?.charAt(0) || 'W'}
                  </div>
                  <div>
                    <p className="author-name" style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{report.user?.name || 'Warga'}</p>
                    <p className="author-email" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--lm-subtext0)' }}>Pelapor Resmi</p>
                  </div>
                </div>

                <div className="detail-dates" style={{ textAlign: 'right' }}>
                  <p className="date-label" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--lm-subtext0)', textTransform: 'uppercase' }}>Tanggal Pengaduan</p>
                  <p className="date-value" style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                    {new Date(report.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                  </p>
                </div>
              </div>

              {/* Location Block */}
              {showLocationSection && (
                <div className="report-location-block" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} color="var(--lm-blue)" /> Lokasi Kejadian
                  </h3>
                  {hasCoords ? (
                    <div style={{ borderRadius: 'var(--lm-radius)', overflow: 'hidden', border: '1px solid var(--lm-surface1)' }}>
                      <LeafletMapView
                        center={[lat, lng]}
                        zoom={15}
                        markerPosition={[lat, lng]}
                        heightPx={260}
                        scrollWheelZoom
                      />
                      {report.location && (
                        <p className="detail-map-caption" style={{ padding: '0.75rem', margin: 0, background: 'var(--lm-surface0)', fontSize: '0.85rem', color: 'var(--lm-subtext0)' }}>
                          📍 {report.location}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="detail-location" style={{ padding: '1rem', background: 'var(--lm-surface0)', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)', fontSize: '0.9rem' }}>
                      📍 {report.location}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="detail-description" style={{ marginBottom: '1.5rem', background: 'var(--lm-surface0)', padding: '1.25rem', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)' }}>
                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>Rincian Laporan</h3>
                <p style={{ margin: 0, color: 'var(--lm-text)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{report.description}</p>
              </div>

              {/* Official Admin Note */}
              {report.admin_note && (
                <div className="admin-note" style={{ background: 'rgba(137, 180, 250, 0.1)', border: '1px solid rgba(137, 180, 250, 0.3)', padding: '1.25rem', borderRadius: 'var(--lm-radius)', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: 'var(--lm-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                    <ShieldCheck size={18} /> Balasan Respon Petugas
                  </h4>
                  <p style={{ margin: 0, color: 'var(--lm-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>{report.admin_note}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Status Update Form (Admin Only) */}
              {isAdmin && (
                <div className="sidebar-card" style={{ background: 'var(--lm-surface0)', padding: '1.25rem', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)' }}>
                  <h3 className="sidebar-title" style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700 }}>Kelola Status Laporan</h3>
                  <AdminStatusForm report={report} onUpdate={fetchReport} reportId={id} />
                </div>
              )}

              {/* Comments Card */}
              <div className="sidebar-card comments-card" style={{ background: 'var(--lm-surface0)', padding: '1.25rem', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)' }}>
                <h3 className="sidebar-title" style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} /> Komentar ({report.comments?.length || 0})
                </h3>

                <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '4px' }}>
                  {(!report.comments || report.comments.length === 0) && (
                    <p className="no-comments" style={{ color: 'var(--lm-subtext0)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                      Belum ada komentar. Berikan tanggapan Anda pertama kali!
                    </p>
                  )}

                  {report.comments?.map((c) => {
                    const isOfficial = c.user?.role === 'admin' || c.user?.role === 'super_admin';
                    return (
                      <div key={c.id} className="comment-item" style={{ background: isOfficial ? 'rgba(137, 180, 250, 0.08)' : 'var(--lm-mantle)', border: isOfficial ? '1px solid rgba(137, 180, 250, 0.25)' : '1px solid var(--lm-surface1)', padding: '0.85rem', borderRadius: 'var(--lm-radius-sm)' }}>
                        <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <div className="comment-author" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="comment-avatar" style={{ width: '26px', height: '26px', borderRadius: '50%', background: isOfficial ? 'var(--lm-blue)' : 'var(--lm-surface2)', color: '#111', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {c.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <span className="comment-name" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.user?.name}</span>
                              {isOfficial && (
                                <span className="role-badge role-admin" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>Petugas</span>
                              )}
                            </div>
                          </div>

                          <div className="comment-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="comment-date" style={{ fontSize: '0.72rem', color: 'var(--lm-overlay)' }}>
                              {new Date(c.created_at).toLocaleDateString("id-ID")}
                            </span>
                            {user && (user.id === c.user_id || isAdmin) && (
                              <button
                                className="comment-delete"
                                onClick={() => handleDeleteComment(c.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--lm-red)', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="comment-content" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--lm-text)', lineHeight: 1.5 }}>{c.content}</p>
                      </div>
                    );
                  })}
                  <div ref={commentsEndRef} />
                </div>

                {user ? (
                  <form className="comment-form" onSubmit={handleComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <textarea
                      className="comment-input"
                      placeholder="Tulis komentar atau informasi tambahan..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      style={{ width: '100%', background: 'var(--lm-mantle)', border: '1px solid var(--lm-surface1)', borderRadius: 'var(--lm-radius-sm)', padding: '0.75rem', color: 'var(--lm-text)', outline: 'none', resize: 'vertical', fontSize: '0.85rem' }}
                    />
                    <button
                      type="submit"
                      className="btn-primary btn-sm"
                      disabled={submitting || !comment.trim()}
                      style={{ alignSelf: 'flex-end', padding: '0.4rem 1rem' }}
                    >
                      {submitting ? "Kirim..." : "Kirim Komentar"}
                    </button>
                  </form>
                ) : (
                  <div className="comment-login" style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                    <Link to="/login" className="btn-secondary btn-sm" style={{ display: 'inline-block', width: '100%' }}>
                      Login untuk Mengirim Komentar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && report.image_url && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <img src={`${API_URL}${report.image_url}`} alt={report.title} className="lightbox-img" />
        </div>
      )}
    </div>
  );
};

const AdminStatusForm = ({ report, onUpdate, reportId }) => {
  const [status, setStatus] = useState(report.status);
  const [note, setNote] = useState(report.admin_note || "");
  const [saving, setSaving] = useState(false);

  const templateNotes = [
    "Laporan telah diverifikasi dan akan ditangani oleh tim teknis hari ini.",
    "Petugas dinas terkait sedang dalam proses pengerjaan di lokasi kejadian.",
    "Pengaduan telah selesai ditindaklanjuti. Fasilitas kini sudah diperbaiki.",
    "Pengaduan tidak dapat diproses karena bukti kurang cukup/lokasi tidak jelas."
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/reports/${reportId}/status`, {
        status,
        admin_note: note,
      });
      toast.success("Status & catatan balasan berhasil diperbarui!");
      onUpdate();
    } catch {
      toast.error("Gagal memperbarui status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-status-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--lm-subtext0)' }}>Ubah Status Laporan</label>
      <select
        className="form-input"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', background: 'var(--lm-mantle)', border: '1px solid var(--lm-surface1)', color: 'var(--lm-text)', borderRadius: 'var(--lm-radius-sm)', outline: 'none' }}
      >
        <option value="pending">⏳ Menunggu Verifikasi</option>
        <option value="in_progress">⚡ Sedang Diproses</option>
        <option value="resolved">✅ Selesai Ditangani</option>
        <option value="rejected">❌ Ditolak / Tidak Valid</option>
      </select>

      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--lm-subtext0)' }}>Catatan Respon Resmi Admin</label>
      <textarea
        placeholder="Tuliskan catatan tindak lanjut untuk pelapor..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        style={{ width: '100%', padding: '0.5rem', background: 'var(--lm-mantle)', border: '1px solid var(--lm-surface1)', color: 'var(--lm-text)', borderRadius: 'var(--lm-radius-sm)', outline: 'none', fontSize: '0.85rem' }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {templateNotes.map((tpl, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setNote(tpl)}
            style={{ background: 'var(--lm-surface1)', border: 'none', color: 'var(--lm-subtext0)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
          >
            + Template {i + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="btn-primary btn-sm"
        disabled={saving}
        style={{ marginTop: '0.5rem', width: '100%' }}
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan Status"}
      </button>
    </div>
  );
};

export default ReportDetail;
