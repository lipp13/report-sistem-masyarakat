import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Camera, MessageSquare, CheckCircle2, ShieldCheck, Zap, Users, ChevronDown } from "lucide-react";
import api from "../api/client";

export default function Landing() {
  const [stats, setStats] = useState({ total: 120, completed: 98, resolution_rate: 85 });
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api.get("/reports/stats")
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "Bagaimana cara membuat laporan pengaduan?",
      a: "Cukup daftar akun gratis, klik tombol 'Buat Laporan', unggah foto bukti, pilih lokasi di peta, dan kirimkan. Tim kami akan memverifikasi dalam waktu 1x24 jam."
    },
    {
      q: "Apakah laporan saya dapat dipantau oleh warga lain?",
      a: "Ya, sistem LaporMas mendukung transparansi publik. Warga lain dapat melihat status penanganan dan memberikan dukungan suara (+1) pada laporan Anda."
    },
    {
      q: "Siapa yang menindaklanjuti pengaduan yang dikirim?",
      a: "Pengaduan akan diverifikasi oleh Admin/Petugas instansi terkait sesuai dengan kategori masalah (Infrastruktur, Kebersihan, Keamanan, dll)."
    }
  ];

  return (
    <div className="landing-page">
      <div className="landing-bg" aria-hidden>
        <span className="landing-blob landing-blob-1" />
        <span className="landing-blob landing-blob-2" />
        <span className="landing-blob landing-blob-3" />
      </div>

      <header className="landing-nav">
        <div className="landing-nav-inner">
          <span className="landing-brand">
            <span className="landing-brand-icon">🏛️</span>
            LaporMas
          </span>
          <div className="landing-nav-actions">
            <Link to="/login" className="landing-link">
              Masuk
            </Link>
            <Link to="/register" className="btn-primary landing-nav-cta">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="landing-hero">
          <p className="landing-kicker">
            <ShieldCheck size={16} className="inline-icon" /> Portal Layanan Pengaduan Masyarakat Transparan
          </p>
          <h1 className="landing-headline">
            Laporkan masalah lingkunganmu,
            <span className="landing-accent"> pantau penangannya </span>
            secara real-time.
          </h1>
          <p className="landing-lead">
            Sistem pengaduan warga modern berbasis lokasi & foto bukti. Terintegrasi langsung dengan petugas untuk respon cepat dan penanganan tuntas.
          </p>
          <div className="landing-cta-row">
            <Link to="/register" className="btn-primary landing-cta-primary">
              Mulai Laporkan <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary landing-cta-secondary">
              Sudah Punya Akun?
            </Link>
          </div>
        </section>

        {/* Live Counter Stats */}
        <section className="stats-ticker-section" style={{ margin: '3rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div className="stat-card" style={{ background: 'rgba(30, 30, 46, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid var(--lm-surface1)', padding: '1.25rem', borderRadius: 'var(--lm-radius)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(137, 180, 250, 0.15)', color: 'var(--lm-blue)', padding: '0.6rem', borderRadius: '10px' }}><Zap size={22} /></div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--lm-text)' }}>{stats.total || 0}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--lm-subtext0)' }}>Total Pengaduan</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ background: 'rgba(30, 30, 46, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid var(--lm-surface1)', padding: '1.25rem', borderRadius: 'var(--lm-radius)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(166, 227, 161, 0.15)', color: 'var(--lm-green)', padding: '0.6rem', borderRadius: '10px' }}><CheckCircle2 size={22} /></div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--lm-green)' }}>{stats.completed || 0}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--lm-subtext0)' }}>Selesai Ditangani</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ background: 'rgba(30, 30, 46, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid var(--lm-surface1)', padding: '1.25rem', borderRadius: 'var(--lm-radius)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(180, 190, 254, 0.15)', color: 'var(--lm-lavender)', padding: '0.6rem', borderRadius: '10px' }}><Users size={22} /></div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--lm-lavender)' }}>{stats.resolution_rate || 90}%</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--lm-subtext0)' }}>Tingkat Penyelesaian</div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="landing-features" aria-labelledby="landing-features-title">
          <h2 id="landing-features-title" className="landing-features-title">
            Mengapa Memilih LaporMas?
          </h2>
          <ul className="landing-feature-grid">
            <li className="landing-feature-card">
              <span className="landing-feature-icon"><MapPin size={26} color="var(--lm-blue)" /></span>
              <h3>Presisi Lokasi GPS</h3>
              <p>Tentukan koordinat persis di peta interaktif untuk memudahkan tim di lapangan.</p>
            </li>
            <li className="landing-feature-card">
              <span className="landing-feature-icon"><Camera size={26} color="var(--lm-mauve)" /></span>
              <h3>Lampiran Bukti Foto</h3>
              <p>Sertakan bukti foto langsung dari perangkat Anda agar laporan lebih valid.</p>
            </li>
            <li className="landing-feature-card">
              <span className="landing-feature-icon"><MessageSquare size={26} color="var(--lm-teal)" /></span>
              <h3>Diskusi & Transparansi</h3>
              <p>Pantau balasan resmi petugas dan dukung (+1) laporan warga lainnya secara terbuka.</p>
            </li>
          </ul>
        </section>

        {/* Step-by-Step Guide */}
        <section style={{ margin: '4rem 0 3rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, marginBottom: '2rem' }}>
            3 Langkah Mudah Pelaporan
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'var(--lm-surface0)', padding: '1.5rem', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lm-blue)', color: 'var(--lm-base)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>1</div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Kirim Laporan</h4>
              <p style={{ margin: 0, color: 'var(--lm-subtext0)', fontSize: '0.9rem' }}>Isi formulir pengaduan dengan memilih kategori, lokasi peta, dan mengunggah foto bukti.</p>
            </div>
            <div style={{ background: 'var(--lm-surface0)', padding: '1.5rem', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lm-teal)', color: 'var(--lm-base)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>2</div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Proses Verifikasi</h4>
              <p style={{ margin: 0, color: 'var(--lm-subtext0)', fontSize: '0.9rem' }}>Admin memverifikasi laporan dan mendisposisikan ke dinas/petugas teknis yang berwenang.</p>
            </div>
            <div style={{ background: 'var(--lm-surface0)', padding: '1.5rem', borderRadius: 'var(--lm-radius)', border: '1px solid var(--lm-surface1)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lm-green)', color: 'var(--lm-base)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>3</div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Penanganan Tuntas</h4>
              <p style={{ margin: 0, color: 'var(--lm-subtext0)', fontSize: '0.9rem' }}>Petugas menyelesaikan masalah di lokasi dan memberikan tanggapan resmi beserta foto hasil.</p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section style={{ margin: '4rem 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, marginBottom: '2rem' }}>
            Pertanyaan Umum (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => toggleFaq(idx)}
                style={{
                  background: 'var(--lm-surface0)',
                  border: '1px solid var(--lm-surface1)',
                  borderRadius: 'var(--lm-radius)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                  <span>{faq.q}</span>
                  <ChevronDown size={18} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
                </div>
                {openFaq === idx && (
                  <p style={{ marginTop: '0.85rem', marginBottom: 0, color: 'var(--lm-subtext0)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© LaporMas — Sistem Pelaporan Pengaduan Masyarakat Transparan & Modern</p>
      </footer>
    </div>
  );
}
