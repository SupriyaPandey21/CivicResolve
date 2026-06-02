import React from "react";
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api, { formatApiErrorDetail } from "../lib/api";

import {
  Plus,
  ChevronRight,
  FileText,
} from "lucide-react";

const SEV_BADGE = {
  high: "cr-badge-high",
  medium: "cr-badge-medium",
  low: "cr-badge-low",
};

export default function Cases() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/grievances")
      .then((r) => setList(r.data))
      .catch((e) =>
        setError(
          formatApiErrorDetail(e.response?.data?.detail) ||
            e.message
        )
      );
  }, []);

  return (
    <div className="cr-container py-10 cr-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            My Cases
          </h1>

          <p className="text-[var(--cr-text-muted)] mt-1">
            Track every grievance you've filed.
          </p>
        </div>

        <Link
          to="/report"
          className="cr-btn-primary"
        >
          <Plus size={18} />
          New Report
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="cr-badge cr-badge-high mt-6 px-3 py-2 w-full justify-start">
          {error}
        </div>
      )}

      {/* Loading */}
      {list === null && (
        <div className="mt-10 text-[var(--cr-text-muted)]">
          Loading...
        </div>
      )}

      {/* Empty */}
      {Array.isArray(list) && list.length === 0 && (
        <div className="cr-card p-12 mt-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--cr-surface-2)] grid place-items-center mx-auto">
            <FileText className="text-[var(--cr-text-muted)]" />
          </div>

          <h3 className="text-xl font-semibold mt-4">
            No cases yet
          </h3>

          <p className="text-[var(--cr-text-muted)] mt-1">
            Start by reporting a civic issue. Our AI will route it
            correctly.
          </p>

          <Link
            to="/report"
            className="cr-btn-primary mt-6 inline-flex"
          >
            File your first complaint
          </Link>
        </div>
      )}

      {/* Cases */}
      {Array.isArray(list) && list.length > 0 && (
        <div className="grid gap-4 mt-8">
          {list.map((g) => (
            <Link
              key={g.id}
              to={`/cases/${g.id}`}
              className="cr-card p-5 flex items-center justify-between hover:border-[var(--cr-primary)] transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs uppercase tracking-widest font-bold text-[var(--cr-text-muted)]">
                    #{g.case_number}
                  </span>

                  <span
                    className={`cr-badge ${
                      SEV_BADGE[g.analysis?.severity]
                    }`}
                  >
                    {g.analysis?.severity}
                  </span>

                  <span
                    className={`cr-badge ${
                      g.confirmed
                        ? "cr-badge-submitted"
                        : "cr-badge-pending"
                    }`}
                  >
                    {g.confirmed
                      ? "Submitted"
                      : "Pending"}
                  </span>
                </div>

                <h3 className="font-semibold text-lg truncate">
                  {g.analysis?.issue_title ||
                    g.description?.slice(0, 60)}
                </h3>

                <p className="text-sm text-[var(--cr-text-muted)] truncate">
                  {g.analysis?.assigned_ministry}
                </p>
              </div>

              <ChevronRight className="shrink-0 text-[var(--cr-text-muted)]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}