import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import LeafletMapView, {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "../components/LeafletMapView";

const CreateReport = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category_id: "",
  });
  /** @type {[number, number] | null} */
  const [coords, setCoords] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then((r) => setCategories(r.data.data))
      .catch(() => {});
  }, []);

  const handleImageChange = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file max 5MB");
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id) {
      toast.error("Pilih kategori terlebih dahulu");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (coords) {
      formData.append("latitude", String(coords[0]));
      formData.append("longitude", String(coords[1]));
    }
    if (image) formData.append("image", image);

    try {
      const res = await api.post("/reports", formData);
      toast.success("Laporan berhasil dikirim!");
      navigate(`/reports/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="form-page">
          <div className="form-page-header">
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
            <div>
              <h1 className="page-title">Buat Laporan Baru</h1>
              <p className="page-subtitle">Sampaikan pengaduanmu kepada kami</p>
            </div>
          </div>

          <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label className="form-label">
                    Judul Laporan <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Deskripsikan masalah secara singkat"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                    maxLength={200}
                  />
                  <span className="char-count">{form.title.length}/200</span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Kategori <span className="required">*</span>
                  </label>
                  <div className="category-grid">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`category-option ${form.category_id == c.id ? "selected" : ""}`}
                        style={{ "--cat-color": c.color }}
                        onClick={() => setForm({ ...form, category_id: c.id })}
                      >
                        <span className="cat-icon">{c.icon}</span>
                        <span className="cat-name">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lokasi di peta</label>
                  <p className="form-map-hint">
                    Klik peta untuk menandai lokasi (opsional). Seret pin untuk
                    menyesuaikan.
                  </p>
                  <LeafletMapView
                    center={coords ?? DEFAULT_MAP_CENTER}
                    zoom={coords ? 15 : DEFAULT_MAP_ZOOM}
                    markerPosition={coords}
                    onMapClick={setCoords}
                    onMarkerDragEnd={setCoords}
                    heightPx={280}
                  />
                  <label
                    className="form-label"
                    style={{ marginTop: "0.85rem" }}
                  >
                    Keterangan alamat (opsional)
                  </label>
                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: patokan di sebelah minimarket"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Deskripsi Lengkap <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Jelaskan detail permasalahan, kapan terjadi, dampak yang ditimbulkan, dll."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                    rows={5}
                  />
                </div>
              </div>

              <div className="form-column">
                <div className="form-group">
                  <label className="form-label">Foto Bukti (opsional)</label>
                  <div
                    className={`dropzone ${dragging ? "dragging" : ""} ${preview ? "has-image" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("imageInput").click()
                    }
                  >
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          alt="Preview"
                          className="image-preview"
                        />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImage(null);
                            setPreview(null);
                          }}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="dropzone-content">
                        <div className="dropzone-icon">📸</div>
                        <p className="dropzone-text">
                          Drag & drop atau klik untuk upload
                        </p>
                        <p className="dropzone-hint">JPG, PNG, WebP max 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                  />
                </div>

                <div className="info-box">
                  <h4>💡 Tips Laporan yang Baik</h4>
                  <ul>
                    <li>Gunakan judul yang jelas dan spesifik</li>
                    <li>Pilih kategori yang sesuai</li>
                    <li>Sertakan lokasi yang tepat</li>
                    <li>Tambahkan foto sebagai bukti</li>
                    <li>Jelaskan dampak permasalahan</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(-1)}
              >
                Batal
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner"></span> Mengirim...
                  </>
                ) : (
                  "📤 Kirim Laporan"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateReport;
