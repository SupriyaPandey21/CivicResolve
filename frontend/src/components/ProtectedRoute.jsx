import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();

  if (!ready) {
    return (
      <div
        className="cr-container py-24 text-center text-[var(--cr-text-muted)]"
        data-testid="route-loading"
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: loc }}
        replace
      />
    );
  }

  return children;
}