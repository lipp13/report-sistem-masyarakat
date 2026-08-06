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
        <section className="landing-hero animate-fade-in">
          <p className="landing-kicker">
            <ShieldCheck size={16} className="inline-icon" /> Portal Layanan Pengaduan Masyarakat Transparan
          </p>
          <h1 className="landing-headline">
            Laporkan masalah lingkunganmu,
            <span className="landing-accent"> pantau penanganannya </span>
            secara real-time.
          </h1>
          <p className="landing-lead">
            Sistem pengaduan warga modern berbasis lokasi & foto bukti. Terintegrasi langsung dengan petugas untuk respon cepat dan penanganan tuntas.
          </p>
          <div className="landing-cta-row">
            <Link to="/register" className="btn-primary landing-cta-primary">
              Mulai Laporkan <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn-secondary landing-cta-secondary">
              Sudah Punya Akun?
            </Link>
          </div>
        </section>

        {/* Live Counter Stats */}
        <section className="landing-stats-grid animate-fade-in animate-delay-1">
          <div className="stat-card stat-card-glass">
            <div className="stat-card-inner">
              <div className="stat-icon-wrapper stat-icon-blue"><Zap size={22} /></div>
              <div>
                <div className="stat-number">{stats.total || 0}</div>
                <div className="stat-label-text">Total Pengaduan</div>
              </div>
            </div>
          </div>

          <div className="stat-card stat-card-glass">
            <div className="stat-card-inner">
              <div className="stat-icon-wrapper stat-icon-green"><CheckCircle2 size={22} /></div>
              <div>
                <div className="stat-number stat-green">{stats.completed || 0}</div>
                <div className="stat-label-text">Selesai Ditangani</div>
              </div>
            </div>
          </div>

          <div className="stat-card stat-card-glass">
            <div className="stat-card-inner">
              <div className="stat-icon-wrapper stat-icon-lavender"><Users size={22} /></div>
              <div>
                <div className="stat-number stat-lavender">{stats.resolution_rate || 90}%</div>
                <div className="stat-label-text">Tingkat Penyelesaian</div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="landing-features animate-fade-in animate-delay-2" aria-labelledby="landing-features-title">
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
        <section className="landing-steps-section animate-fade-in animate-delay-3">
          <h2 className="section-title-center">
            3 Langkah Mudah Pelaporan
          </h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number step-number-1">1</div>
              <h4>Kirim Laporan</h4>
              <p>Isi formulir pengaduan dengan memilih kategori, lokasi peta, dan mengunggah foto bukti.</p>
            </div>
            <div className="step-card">
              <div className="step-number step-number-2">2</div>
              <h4>Proses Verifikasi</h4>
              <p>Admin memverifikasi laporan dan mendisposisikan ke dinas/petugas teknis yang berwenang.</p>
            </div>
            <div className="step-card">
              <div className="step-number step-number-3">3</div>
              <h4>Penanganan Tuntas</h4>
              <p>Petugas menyelesaikan masalah di lokasi dan memberikan tanggapan resmi beserta foto hasil.</p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="landing-faq-section animate-fade-in">
          <h2 className="section-title-center">
            Pertanyaan Umum (FAQ)
          </h2>
          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-item ${openFaq === idx ? 'open' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className="faq-chevron" />
                </div>
                {openFaq === idx && (
                  <p className="faq-answer">
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
