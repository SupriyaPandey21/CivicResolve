import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { formatApiErrorDetail } from "../lib/api";

import { Landmark, ArrowRight } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(email, password, name);
      nav("/report");
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
      {/* Left Side */}
      <div className="hidden md:flex bg-[var(--cr-primary)] text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 cr-grid-bg opacity-30" />

        <div className="relative max-w-md self-end">
          <div className="w-12 h-12 rounded-md bg-[var(--cr-accent)] grid place-items-center mb-6">
            <Landmark size={22} />
          </div>

          <h2 className="text-3xl font-bold tracking-tight">
            Join CivicResolve.
          </h2>

          <p className="mt-3 text-white/70">
            File complaints, track resolutions, and contribute to a transparent,
            accountable government.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <h1 className="text-3xl font-bold tracking-tight">
            Create account
          </h1>

          <p className="text-[var(--cr-text-muted)] mt-2 mb-8">
            Get started in under a minute.
          </p>

          {error && (
            <div className="cr-badge cr-badge-high mb-5 px-3 py-2 w-full justify-start">
              {error}
            </div>
          )}

          {/* Name */}
          <label className="text-xs uppercase tracking-widest font-bold">
            Full name
          </label>

          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="cr-input mt-2 mb-5"
            placeholder="Jane Citizen"
          />

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cr-input mt-2 mb-6"
            placeholder="At least 6 characters"
          />

          <button disabled={loading} className="cr-btn-primary w-full">
            {loading ? (
              "Creating..."
            ) : (
              <>
                Create account
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="text-sm text-[var(--cr-text-muted)] mt-6 text-center">
            Already a member?{" "}
            <Link
              to="/login"
              className="text-[var(--cr-primary)] font-semibold underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}