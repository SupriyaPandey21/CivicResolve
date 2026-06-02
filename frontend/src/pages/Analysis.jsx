import React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api, { formatApiErrorDetail } from "../lib/api";
import {
  AlertTriangle,
  Building2,
  ArrowRight,
  Check,
  Tag,
} from "lucide-react";

const SEV_LABEL = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const SEV_BADGE = {
  high: "cr-badge-high",
  medium: "cr-badge-medium",
  low: "cr-badge-low",
};

const SEV_NOTE = {
  high: "Prioritized due to potential public health risk or safety impact.",
  medium: "Service disruption affecting multiple citizens.",
  low: "Localized issue with low urgency.",
};

export default function Analysis() {
  const { id } = useParams();
  const loc = useLocation();
  const nav = useNavigate();

  const [g, setG] = useState(loc.state?.grievance || null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!g) {
      api
        .get(`/grievances/${id}`)
        .then((r) => setG(r.data))
        .catch((e) =>
          setError(
            formatApiErrorDetail(e.response?.data?.detail) || e.message
          )
        );
    }
  }, [id, g]);

  const confirm = async () => {
    setConfirming(true);
    setError("");

    try {
      const res = await api.post(`/grievances/${id}/confirm`);

      nav(`/cases/${id}`, {
        state: { grievance: res.data },
      });
    } catch (e) {
      setError(
        formatApiErrorDetail(e.response?.data?.detail) || e.message
      );
    } finally {
      setConfirming(false);
    }
  };

  if (!g) {
    return (
      <div
        className="cr-container py-20 text-center text-[var(--cr-text-muted)]"
        data-testid="analysis-loading"
      >
        Loading analysis...
      </div>
    );
  }

  const a = g.analysis;

  return (
    <div className="cr-container py-10 cr-fade-up">
      <div className="max-w-3xl mx-auto">

        {/* Stepper */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full grid place-items-center font-bold text-sm cr-step-done">
            <Check size={16} />
          </div>

          <span className="text-sm font-semibold">Report</span>

          <div className="w-10 h-px bg-[var(--cr-border-strong)]" />

          <div className="w-9 h-9 rounded-full grid place-items-center font-bold text-sm cr-step-active">
            2
          </div>

          <span className="text-sm font-semibold">Analysis</span>

          <div className="w-10 h-px bg-[var(--cr-border-strong)]" />

          <div className="w-9 h-9 rounded-full grid place-items-center font-bold text-sm cr-step-idle">
            3
          </div>

          <span className="text-sm text-[var(--cr-text-muted)] font-semibold">
            Submission
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          AI Analysis Complete
        </h1>

        <p className="text-[var(--cr-text-muted)] mt-2">
          Our artificial intelligence has categorized your report based on the
          provided evidence and description for official routing.
        </p>

        {error && (
          <div
            className="cr-badge cr-badge-high mt-5 mb-2 px-3 py-2 w-full justify-start"
            data-testid="analysis-error"
          >
            {error}
          </div>
        )}

        {/* Severity */}
        <div
          className="cr-card p-7 mt-8"
          data-testid="analysis-severity-card"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--cr-text-muted)] font-bold">
            <AlertTriangle size={14} />
            Severity Level
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`cr-badge ${SEV_BADGE[a.severity]}`}
              data-testid="analysis-severity-badge"
            >
              {SEV_LABEL[a.severity]}
            </span>

            <span className="text-sm text-[var(--cr-text-muted)]">
              {SEV_NOTE[a.severity]}
            </span>
          </div>
        </div>

        {/* Issue */}
        <div
          className="cr-card p-7 mt-5"
          data-testid="analysis-issue-card"
        >
          <div className="text-xs uppercase tracking-widest text-[var(--cr-text-muted)] font-bold flex items-center gap-2">
            <Tag size={14} />
            Identified Issue
          </div>

          <h2 className="text-2xl font-bold mt-2">
            {a.issue_title}
          </h2>

          <div className="text-[var(--cr-text-muted)] mt-1">
            {a.issue_category}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {(a.tags || []).map((t) => (
              <span
                key={t}
                className="px-2 py-1 rounded-md bg-[var(--cr-surface-2)] text-xs font-semibold text-[var(--cr-text)]"
              >
                {t}
              </span>
            ))}
          </div>

          <p className="mt-5 text-[var(--cr-text)]">
            {a.summary}
          </p>
        </div>

        {/* Ministry */}
        <div
          className="cr-card p-7 mt-5"
          data-testid="analysis-ministry-card"
        >
          <div className="text-xs uppercase tracking-widest text-[var(--cr-text-muted)] font-bold flex items-center gap-2">
            <Building2 size={14} />
            Assigned Ministry
          </div>

          <h3 className="text-xl font-semibold mt-2">
            {a.assigned_ministry}
          </h3>

          <div className="text-[var(--cr-text-muted)] mt-1">
            {a.ministry_reason}
          </div>

          <div className="mt-3">
            <span className="cr-badge cr-badge-pending">
              Pending Verification
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="cr-card p-7 mt-5">
          <div className="text-xs uppercase tracking-widest text-[var(--cr-text-muted)] font-bold">
            Original Problem Description
          </div>

          <p className="mt-2 italic">
            "{g.description}"
          </p>
        </div>

        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 mt-8">
          <p className="text-xs text-[var(--cr-text-muted)] md:max-w-md">
            By confirming, you verify the AI categorization is accurate.
            You will receive a unique tracking link for your case.
          </p>

          <button
            onClick={confirm}
            disabled={confirming}
            className="cr-btn-primary"
            data-testid="analysis-confirm-btn"
          >
            {confirming ? (
              "Confirming..."
            ) : (
              <>
                Confirm & Get Link <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}