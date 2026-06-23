import { Link } from "react-router-dom";

export default function Landing() {
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
              Daftar
            </Link>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <p className="landing-kicker">Pengaduan masyarakat — cepat & transparan</p>
          <h1 className="landing-headline">
            Laporkan masalah di lingkunganmu,
            <span className="landing-accent"> pantau statusnya </span>
            dalam satu sistem.
          </h1>
          <p className="landing-lead">
            Kirim laporan dengan foto dan lokasi di peta, pantau tanggapan petugas,
            dan ikuti perkembangan pengaduan hingga selesai.
          </p>
          <div className="landing-cta-row">
            <Link to="/register" className="btn-primary landing-cta-primary">
              Mulai laporkan
            </Link>
            <Link to="/login" className="btn-secondary landing-cta-secondary">
              Sudah punya akun?
            </Link>
          </div>
        </section>

        <section className="landing-features" aria-labelledby="landing-features-title">
          <h2 id="landing-features-title" className="landing-features-title">
            Mengapa LaporMas?
          </h2>
          <ul className="landing-feature-grid">
            <li className="landing-feature-card">
              <span className="landing-feature-icon">📍</span>
              <h3>Lokasi di peta</h3>
              <p>Tandai lokasi kejadian di peta agar penanganan lebih akurat.</p>
            </li>
            <li className="landing-feature-card">
              <span className="landing-feature-icon">📸</span>
              <h3>Bukti foto</h3>
              <p>Lampirkan gambar untuk mendukung laporan Anda.</p>
            </li>
            <li className="landing-feature-card">
              <span className="landing-feature-icon">💬</span>
              <h3>Kolom komentar</h3>
              <p>Berkomunikasi dengan pengurus laporan secara terbuka.</p>
            </li>
          </ul>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© LaporMas — sistem pelaporan pengaduan masyarakat</p>
      </footer>
    </div>
  );
}
