import React from "react";
import { useEffect, useState } from "react";

import {
  useLocation,
  useParams,
  Link,
} from "react-router-dom";

import api, {
  formatApiErrorDetail,
} from "../lib/api";

import {
  Check,
  ExternalLink,
  Bookmark,
  MapPin,
  Building2,
  Clock,
} from "lucide-react";

const SEV_BADGE = {
  high: "cr-badge-high",
  medium: "cr-badge-medium",
  low: "cr-badge-low",
};
 const PORTAL_LINKS = {
  "Ministry of Urban Development": "https://mohua.gov.in/",
  "Ministry of Health": "https://mohfw.gov.in/",
  "Ministry of Transport": "https://morth.nic.in/",
  "Ministry of Water Resources": "https://jalshakti-dowr.gov.in/",
  "Ministry of Environment": "https://moef.gov.in/",
  "Ministry of Education": "https://www.education.gov.in/",
  "Ministry of Electricity": "https://powermin.gov.in/",
  "Ministry of Public Safety": "https://pgportal.gov.in/",
  "Ministry of Public Works": "https://pgportal.gov.in/",
};

const SEV_LABEL = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

export default function CaseDetail() {
  const { id } = useParams();

  const loc = useLocation();

  const [g, setG] = useState(
    loc.state?.grievance || null
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (!g) {
      api
        .get(`/grievances/${id}`)
        .then((r) => setG(r.data))
        .catch((e) =>
          setError(
            formatApiErrorDetail(
              e.response?.data?.detail
            ) || e.message
          )
        );
    }
  }, [id, g]);

  if (error) {
    return (
      <div className="cr-container py-20 text-center">
        {error}
      </div>
    );
  }

  if (!g) {
    return (
      <div className="cr-container py-20 text-[var(--cr-text-muted)] text-center">
        Loading case...
      </div>
    );
  }

  const a = g.analysis;

  const isSubmitted = g.confirmed;

  return (
    <div className="cr-container py-10 cr-fade-up">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          to="/cases"
          className="text-sm text-[var(--cr-text-muted)] hover:text-[var(--cr-text)]"
        >
          ← Back to all cases
        </Link>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">
          Case #{g.case_number}
        </h1>
        <div className="mt-2 text-sm text-[var(--cr-text-muted)]">
  <span className="font-semibold">
    Tracking ID:
  </span>{" "}
  <span className="text-[var(--cr-text)]">
    {g.tracking_id || "Not Available"}
  </span>
</div>

        <p className="text-[var(--cr-text-muted)] mt-1">
          {a?.issue_category} · Reported{" "}
          {new Date(g.created_at).toLocaleString()}
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {/* Progress */}
          <div className="cr-card p-6 md:col-span-1">
            <div className="text-xs uppercase tracking-widest font-bold mb-4">
              Filing Progress
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full grid place-items-center bg-[var(--cr-success)] text-white">
                  <Check size={14} />
                </span>

                <div>
                  <div className="font-semibold">
                    Analysis Complete
                  </div>

                  <div className="text-xs text-[var(--cr-text-muted)]">
                    Verified by AI
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full grid place-items-center bg-[var(--cr-success)] text-white">
                  <Building2 size={14} />
                </span>

                <div>
                  <div className="font-semibold">
                    Ministry Identified
                  </div>

                  <div className="text-xs text-[var(--cr-text-muted)]">
                    {a?.assigned_ministry}
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span
                  className={`w-7 h-7 rounded-full grid place-items-center text-white ${
                    isSubmitted
                      ? "bg-[var(--cr-success)]"
                      : "bg-[var(--cr-border-strong)]"
                  }`}
                >
                  <ExternalLink size={14} />
                </span>

                <div>
                  <div className="font-semibold">
                    {isSubmitted
                      ? "Submitted to Ministry"
                      : "Ready to Submit"}
                  </div>

                  <div className="text-xs text-[var(--cr-text-muted)]">
                    {isSubmitted
                      ? "Case forwarded"
                      : "Confirm to file"}
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-5">
            {/* Summary */}
            <div className="cr-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`cr-badge ${
                    SEV_BADGE[a?.severity]
                  }`}
                >
                  {SEV_LABEL[a?.severity]}
                </span>

                <span
                  className={`cr-badge ${
                    isSubmitted
                      ? "cr-badge-submitted"
                      : "cr-badge-pending"
                  }`}
                >
                  {isSubmitted
                    ? "Submitted"
                    : "Pending"}
                </span>
              </div>

              <h2 className="text-xl font-semibold mt-2">
                {a?.issue_title}
              </h2>

              <p className="text-[var(--cr-text)] mt-3">
                {g.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {g.location && (
                  <div className="flex items-center gap-2 text-[var(--cr-text-muted)]">
                    <MapPin size={14} />
                    {g.location}
                  </div>
                )}

                <div className="flex items-center gap-2 text-[var(--cr-text-muted)]">
                  <Clock size={14} />
                  Response in{" "}
                  {a?.estimated_response_days} business
                  days
                </div>
              </div>

              {g.photo_base64 && (
                <img
                  src={g.photo_base64}
                  alt="evidence"
                  className="mt-5 rounded-lg border border-[var(--cr-border)] max-h-72"
                />
              )}
            </div>

            {/* Target */}
            <div className="cr-card p-6">
              <div className="text-xs uppercase tracking-widest font-bold mb-2">
                Target Portal
              </div>

              <h3 className="text-lg font-semibold">
                {a?.assigned_ministry}
              </h3>

              <p className="text-sm text-[var(--cr-text-muted)] mt-1">
                Standard response time:{" "}
                <strong className="text-[var(--cr-text)]">
                  {a?.estimated_response_days} business
                  days
                </strong>
              </p>
            </div>

            {/* Submit */}
            <div className="cr-card p-6">
              <div className="text-xs uppercase tracking-widest font-bold mb-1">
                Official Submission
              </div>

              <h3 className="text-lg font-semibold">
                {isSubmitted
                  ? "Case has been forwarded to the ministry."
                  : "Confirm to forward to the ministry."}
              </h3>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
  href={
    PORTAL_LINKS[a?.assigned_ministry] ||
    "https://pgportal.gov.in/"
  }
  target="_blank"
  rel="noopener noreferrer"
  className="cr-btn-primary"
>
  {isSubmitted
    ? "Open Portal"
    : "Go to Official Portal"}

  <ExternalLink size={16} />
</a>
<button
  className="cr-btn-outline"
  onClick={async () => {
    try {
      await navigator.clipboard.writeText(
        `Case Number: ${g.case_number}
Issue: ${a?.issue_title}
Location: ${g.location}
Status: ${isSubmitted ? "Submitted" : "Pending"}`
      );

      alert("Reference copied successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to copy reference");
    }
  }}
>
  <Bookmark size={16} />
  Save Reference
</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}