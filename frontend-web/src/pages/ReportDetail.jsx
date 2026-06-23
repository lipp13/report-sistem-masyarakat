import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import LeafletMapView from "../components/LeafletMapView";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function parseCoord(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const ReportDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const commentsEndRef = useRef(null);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/reports/${id}`);
      setReport(res.data.data);
    } catch {
      toast.error("Laporan tidak ditemukan");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

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
        200,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambah komentar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Hapus komentar ini?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      fetchReport();
      toast.success("Komentar dihapus");
    } catch {
      toast.error("Gagal menghapus komentar");
    }
  };

  const handleDeleteReport = async () => {
    if (!confirm("Hapus laporan ini secara permanen?")) return;
    setDeleting(true);
    try {
      await api.delete(`/reports/${id}`);
      toast.success("Laporan dihapus");
      navigate("/dashboard");
    } catch {
      toast.error("Gagal menghapus laporan");
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="loading-screen">
            <div className="spinner"></div>
          </div>
        </main>
      </div>
    );

  if (!report) return null;

  const canManage =
    user &&
    (user.id === report.user_id ||
      ["admin", "super_admin"].includes(user.role));
  const isAdmin = user && ["admin", "super_admin"].includes(user.role);

  const lat = parseCoord(report.latitude);
  const lng = parseCoord(report.longitude);
  const hasCoords = lat !== null && lng !== null;
  const showLocationSection = Boolean(report.location || hasCoords);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="detail-page">
          <div className="detail-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
            {canManage && (
              <div className="detail-actions">
                <button
                  className="btn-danger-sm"
                  onClick={handleDeleteReport}
                  disabled={deleting}
                >
                  {deleting ? "..." : "🗑️ Hapus"}
                </button>
              </div>
            )}
          </div>

          <div className="detail-content">
            <div className="detail-main">
              {/* Image */}
              {report.image_url && (
                <div className="detail-image-wrap">
                  <img
                    src={`${API_URL}${report.image_url}`}
                    alt={report.title}
                    className="detail-image"
                  />
                </div>
              )}

              {/* Meta */}
              <div className="detail-meta">
                <span
                  className="detail-category"
                  style={{
                    backgroundColor: report.category?.color + "20",
                    color: report.category?.color,
                  }}
                >
                  {report.category?.icon} {report.category?.name}
                </span>
                <StatusBadge status={report.status} size="md" />
              </div>

              <h1 className="detail-title">{report.title}</h1>

              <div className="detail-info-row">
                <div className="detail-author">
                  <div className="author-avatar-lg">
                    {report.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="author-name">{report.user?.name}</p>
                    <p className="author-email">{report.user?.email}</p>
                  </div>
                </div>
                <div className="detail-dates">
                  <p className="date-label">Dilaporkan</p>
                  <p className="date-value">
                    {new Date(report.created_at).toLocaleDateString("id-ID", {
                      dateStyle: "long",
                    })}
                  </p>
                </div>
              </div>

              {showLocationSection ? (
                <div className="report-location-block">
                  <h3>Lokasi kejadian</h3>
                  {hasCoords ? (
                    <>
                      <LeafletMapView
                        center={[lat, lng]}
                        zoom={15}
                        markerPosition={[lat, lng]}
                        heightPx={260}
                        scrollWheelZoom
                      />
                      {report.location ? (
                        <p className="detail-map-caption">{report.location}</p>
                      ) : null}
                    </>
                  ) : (
                    <div className="detail-location">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {report.location}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="detail-description">
                <h3>Deskripsi Laporan</h3>
                <p>{report.description}</p>
              </div>

              {report.admin_note && (
                <div className="admin-note">
                  <h4>📝 Catatan Admin</h4>
                  <p>{report.admin_note}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="detail-sidebar">
              {/* Status Card */}
              <div className="sidebar-card">
                <h3 className="sidebar-title">Status Laporan</h3>
                <div className="status-display">
                  <StatusBadge status={report.status} size="lg" />
                </div>
                {isAdmin && (
                  <AdminStatusForm
                    report={report}
                    onUpdate={fetchReport}
                    reportId={id}
                  />
                )}
              </div>

              {/* Comments */}
              <div className="sidebar-card comments-card">
                <h3 className="sidebar-title">
                  💬 Komentar ({report.comments?.length || 0})
                </h3>
                <div className="comments-list">
                  {report.comments?.length === 0 && (
                    <p className="no-comments">
                      Belum ada komentar. Jadilah yang pertama!
                    </p>
                  )}
                  {report.comments?.map((c) => (
                    <div key={c.id} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-author">
                          <div className="comment-avatar">
                            {c.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <span className="comment-name">{c.user?.name}</span>
                            {c.user?.role !== "user" && (
                              <span
                                className={`comment-role role-${c.user?.role}`}
                              >
                                {c.user?.role}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="comment-right">
                          <span className="comment-date">
                            {new Date(c.created_at).toLocaleDateString("id-ID")}
                          </span>
                          {user && (user.id === c.user_id || isAdmin) && (
                            <button
                              className="comment-delete"
                              onClick={() => handleDeleteComment(c.id)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="comment-content">{c.content}</p>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>

                {user ? (
                  <form className="comment-form" onSubmit={handleComment}>
                    <textarea
                      className="comment-input"
                      placeholder="Tulis komentar..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <button
                      type="submit"
                      className="btn-primary btn-sm"
                      disabled={submitting || !comment.trim()}
                    >
                      {submitting ? "..." : "Kirim"}
                    </button>
                  </form>
                ) : (
                  <div className="comment-login">
                    <Link to="/login" className="btn-secondary btn-sm">
                      Login untuk komentar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const AdminStatusForm = ({ report, onUpdate, reportId }) => {
  const [status, setStatus] = useState(report.status);
  const [note, setNote] = useState(report.admin_note || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/reports/${reportId}/status`, {
        status,
        admin_note: note,
      });
      toast.success("Status berhasil diperbarui!");
      onUpdate();
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-status-form">
      <select
        className="form-input"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="pending">⏳ Menunggu</option>
        <option value="approved">✅ Disetujui</option>
        <option value="rejected">❌ Ditolak</option>
      </select>
    </div>
  );
};

export default ReportDetail;
