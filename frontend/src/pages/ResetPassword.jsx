import React, { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api, { formatApiErrorDetail } from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        new_password: password,
      });

      setSuccess(res.data.message || "Password reset successful");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        formatApiErrorDetail(err.response?.data?.detail) ||
          err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cr-container py-20 max-w-md">
      <h1 className="text-3xl font-bold">Reset Password</h1>

      <p className="text-[var(--cr-text-muted)] mt-2 mb-6">
        Enter a new password for your account.
      </p>

      {error && (
        <div className="cr-badge cr-badge-high mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="cr-badge cr-badge-low mb-4">
          {success}
        </div>
      )}

      <form onSubmit={submit} className="cr-card p-6">
        <label className="text-xs uppercase tracking-widest font-bold">
          New Password
        </label>

        <input
          type="password"
          required
          minLength={6}
          className="cr-input mt-2 mb-5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
        />

        <label className="text-xs uppercase tracking-widest font-bold">
          Confirm Password
        </label>

        <input
          type="password"
          required
          minLength={6}
          className="cr-input mt-2 mb-5"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
        />

        <button
          type="submit"
          className="cr-btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <Link
        to="/login"
        className="block mt-6 text-sm underline"
      >
        Back to login
      </Link>
    </div>
  );
}