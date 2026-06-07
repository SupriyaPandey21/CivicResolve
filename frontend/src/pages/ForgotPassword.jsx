import React, { useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setResult(res.data.reset_token || res.data.message);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cr-container py-20 max-w-md">
      <h1 className="text-3xl font-bold">Forgot password</h1>
      <p className="text-[var(--cr-text-muted)] mt-2 mb-6">
        Enter your email to generate a password reset token.
      </p>

      {error && <div className="cr-badge cr-badge-high mb-4">{error}</div>}

      <form onSubmit={submit} className="cr-card p-6">
        <label className="text-xs uppercase tracking-widest font-bold">
          Email
        </label>

        <input
          type="email"
          required
          className="cr-input mt-2 mb-5"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <button className="cr-btn-primary w-full" disabled={loading}>
          {loading ? "Generating..." : "Generate reset token"}
        </button>
      </form>

      {result && (
        <div className="cr-card p-5 mt-5">
          <div className="text-sm font-semibold mb-2">Reset token</div>
          <div className="break-all text-sm">{result}</div>

          <Link
            to={`/reset-password?token=${result}`}
            className="cr-btn-primary mt-4"
          >
            Continue to reset password
          </Link>
        </div>
      )}

      <Link to="/login" className="block mt-6 text-sm underline">
        Back to login
      </Link>
    </div>
  );
}