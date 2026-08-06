import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import LeafletMapView, {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "../components/LeafletMapView";
import { MapPin, Navigation, ArrowLeft, Upload, Camera, Image as ImageIcon, Trash2, FileCheck } from "lucide-react";

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
  const [fileDetails, setFileDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [geolocating, setGeolocating] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then((r) => setCategories(r.data.data))
      .catch(() => {});
  }, []);

  const handleImageChange = (file) => {
    if (!file) return;
    const allowedExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'heif', 'bmp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    if (ext && !allowedExts.includes(ext) && !file.type.startsWith('image/')) {
      toast.error("Format file harus berupa gambar (.png, .jpg, .jpeg, .webp, dll).");
      return;
    }

    setImage(file);
    setFileDetails({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      type: ext?.toUpperCase() || 'IMG',
    });

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

  const clearImage = (e) => {
    if (e) e.stopPropagation();
    setImage(null);
    setPreview(null);
    setFileDetails(null);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Browser Anda tidak mendukung fitur Geolocation.");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords([latitude, longitude]);
        toast.success("Lokasi GPS berhasil didapatkan!");
        setGeolocating(false);
      },
      (err) => {
        toast.error("Gagal mendapatkan lokasi GPS: " + err.message);
        setGeolocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id) {
      toast.error("Pilih kategori pengaduan terlebih dahulu.");
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
      toast.success("Laporan Anda berhasil dikirim!");
      navigate(`/reports/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim laporan.");
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
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </button>
            <div className="header-text-group">
              <h1 className="page-title">Buat Laporan Pengaduan</h1>
              <p className="page-subtitle">Sampaikan pengaduan fasilitas publik Anda beserta foto bukti (.png, .jpg, .webp)</p>
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
                    placeholder="Contoh: Jalan berlubang di Jl. Sudirman No. 45"
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
                    Kategori Pengaduan <span className="required">*</span>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Lokasi di Peta</label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={geolocating}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'rgba(137, 180, 250, 0.15)',
                        color: 'var(--lm-blue)',
                        border: '1px solid rgba(137, 180, 250, 0.3)',
                        borderRadius: 'var(--lm-radius-sm)',
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Navigation size={13} /> {geolocating ? "Mengambil GPS..." : "Gunakan Lokasi Saya"}
                    </button>
                  </div>
                  <p className="form-map-hint">
                    Klik peta untuk menandai titik presisi kejadian. Seret penanda (pin) jika perlu.
                  </p>
                  <LeafletMapView
                    center={coords ?? DEFAULT_MAP_CENTER}
                    zoom={coords ? 15 : DEFAULT_MAP_ZOOM}
                    markerPosition={coords}
                    onMapClick={setCoords}
                    onMarkerDragEnd={setCoords}
                    heightPx={280}
                  />

                  <label className="form-label" style={{ marginTop: "0.85rem" }}>
                    Keterangan Alamat / Patokan (opsional)
                  </label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon" size={18} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Di depan halte busway / dekat Pos RW 05"
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
                    placeholder="Jelaskan secara rinci mengenai masalah ini, kronologi, waktu kejadian, serta dampaknya pada warga..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                    rows={5}
                  />
                </div>
              </div>

              {/* Upload Column */}
              <div className="form-column">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Unggah Foto Bukti Kejadian</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--lm-blue)', fontWeight: 600 }}>Support .PNG, .JPG, .WEBP</span>
                  </label>

                  <div
                    className={`dropzone ${dragging ? "dragging" : ""} ${preview ? "has-image" : ""}`}
                    style={{
                      border: '2px dashed var(--lm-surface2)',
                      borderRadius: 'var(--lm-radius)',
                      padding: preview ? '1rem' : '2rem 1.5rem',
                      background: 'var(--lm-surface0)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ position: 'relative', width: '100%', maxHeight: '240px', overflow: 'hidden', borderRadius: 'var(--lm-radius-sm)' }}>
                          <img
                            src={preview}
                            alt="Preview Bukti Laporan"
                            style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'rgba(243, 139, 168, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                            }}
                            title="Hapus foto"
                          >
                            ✕
                          </button>
                        </div>

                        {fileDetails && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'var(--lm-mantle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--lm-radius-sm)', border: '1px solid var(--lm-surface1)', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                              <FileCheck size={16} color="var(--lm-green)" />
                              <span style={{ fontWeight: 600, color: 'var(--lm-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                                {fileDetails.name}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ background: 'rgba(137, 180, 250, 0.2)', color: 'var(--lm-blue)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                                {fileDetails.type}
                              </span>
                              <span style={{ color: 'var(--lm-subtext0)' }}>{fileDetails.size}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="dropzone-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(137, 180, 250, 0.15)', color: 'var(--lm-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Upload size={26} />
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--lm-text)' }}>
                            Tarik & Lepas Foto di Sini
                          </p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--lm-subtext0)' }}>
                            atau klik untuk jelajahi berkas galeri/kamera
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                          {['.PNG', '.JPG', '.JPEG', '.WEBP', '.HEIC'].map((ext) => (
                            <span key={ext} style={{ background: 'var(--lm-surface1)', color: 'var(--lm-subtext0)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                              {ext}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.heic,.heif,.bmp"
                    className="hidden"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageChange(e.target.files[0])}
                  />
                </div>

                <div className="info-box">
                  <h4>💡 Panduan Laporan Efektif</h4>
                  <ul>
                    <li>Gunakan judul singkat yang mendeskripsikan inti masalah</li>
                    <li>Pilih kategori yang paling sesuai</li>
                    <li>Gunakan tombol GPS atau tentukan titik lokasi pada peta</li>
                    <li>Sertakan foto bukti kondisi di lapangan (PNG/JPG/WEBP)</li>
                    <li>Jelaskan detail untuk mempercepat tindakan petugas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
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
                    <span className="btn-spinner"></span> Mengirim Laporan...
                  </>
                ) : (
                  "Kirim Laporan Pengaduan"
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
