import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("SUBMIT JALAN");

    setLoading(true);

    try {
      await login(form.email, form.password);

      console.log("LOGIN SUKSES");

      toast.success("Login berhasil!");
      navigate("/dashboard");
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      console.log("RESPONSE:", err.response?.data);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.msg ||
        "Email atau password salah / akun belum terdaftar";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-circle c1"></div>
        <div className="auth-bg-circle c2"></div>
        <div className="auth-bg-circle c3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🏛️</div>
          <h1 className="auth-title">LaporMas</h1>
          <p className="auth-subtitle">Sistem Pelaporan Pengaduan Masyarakat</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>

              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="Masukkan email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>

              <input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                className="form-input"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner"></span> : "Masuk"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Belum punya akun?{" "}
            <Link to="/register" className="auth-link">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
