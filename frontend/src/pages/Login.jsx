import React from "react";
import { useState } from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { formatApiErrorDetail } from "../lib/api";

import {
  Landmark,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const { login } = useAuth();

  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);

      const to = loc.state?.from?.pathname || "/cases";

      nav(to);
    } catch (err) {
      setError(
        formatApiErrorDetail(err.response?.data?.detail) || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid md:grid-cols-2">
      {/* Left Section */}
      <div className="hidden md:flex bg-[var(--cr-primary)] text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 cr-grid-bg opacity-30" />

        <div className="relative max-w-md self-end">
          <div className="w-12 h-12 rounded-md bg-[var(--cr-accent)] grid place-items-center mb-6">
            <Landmark size={22} />
          </div>

          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, citizen.
          </h2>

          <p className="mt-3 text-white/70">
            Sign in to track your reported issues and file new complaints.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            Sign in
          </h1>

          <p className="text-[var(--cr-text-muted)] mt-2 mb-8">
            Access your CivicResolve account.
          </p>

          {error && (
            <div className="cr-badge cr-badge-high mb-5 px-3 py-2 w-full justify-start">
              {error}
            </div>
          )}

          {/* Email */}
          <label className="text-xs uppercase tracking-widest font-bold">
            Email
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cr-input mt-2 mb-5"
            placeholder="you@example.com"
          />

          {/* Password */}
          <label className="text-xs uppercase tracking-widest font-bold">
            Password
          </label>

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cr-input mt-2 mb-6"
            placeholder="••••••••"
          />

          <button
            disabled={loading}
            className="cr-btn-primary w-full"
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign in
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="text-sm text-[var(--cr-text-muted)] mt-6 text-center">
            No account?{" "}
            <Link
              to="/register"
              className="text-[var(--cr-primary)] font-semibold underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}