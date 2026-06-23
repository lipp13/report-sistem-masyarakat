import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Landing from "../pages/Landing";

export default function HomeRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen landing-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}
