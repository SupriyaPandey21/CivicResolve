import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Map,
  Brain,
  FileText,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

export default function Landing() {
  const { user } = useAuth();
  const [latestCase, setLatestCase] = useState(null);

  const ctaTo = user ? "/report" : "/register";

  useEffect(() => {
    if (!user) return;

    api
      .get("/grievances")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setLatestCase(res.data[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch latest case:", err);
      });
  }, [user]);

  return (
    <div className="cr-fade-up">
      <section className="bg-[var(--cr-primary)] text-white relative overflow-hidden">
        <div className="absolute inset-0 cr-grid-bg opacity-30" />

        <div className="cr-container relative py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs uppercase tracking-widest mb-6">
              <Sparkles size={14} className="text-[var(--cr-accent)]" />
              AI-Powered Civic Triage
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Your voice,
              <br />
              routed to the right desk.
            </h1>

            <p className="mt-6 text-white/75 text-lg max-w-xl">
              CivicResolve reads citizen complaints — text and photo — and uses
              AI to triage them into the correct ministry within seconds.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to={ctaTo} className="cr-btn-primary">
                File a complaint
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/ministries"
                className="text-white/80 hover:text-white text-sm font-semibold inline-flex items-center gap-2 px-2 py-3"
              >
                Browse ministries
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              <div className="p-6 rounded-2xl bg-[var(--cr-primary-2)] text-white shadow-xl">
                <div className="text-xs text-white/60 uppercase tracking-widest">
                  {latestCase
                    ? `Case #${latestCase.case_number}`
                    : user
                    ? "No Cases Yet"
                    : "Demo Case"}
                </div>

                <div className="mt-2 text-white text-xl font-semibold">
                  {latestCase?.analysis?.issue_title ||
                    "File your first complaint"}
                </div>

                <div className="mt-1 text-white/70 text-sm">
                  Routed to{" "}
                  {latestCase?.analysis?.assigned_ministry ||
                    "Ministry Assignment Pending"}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  {latestCase ? (
                    <>
                      <span
                        className={`cr-badge ${
                          latestCase.analysis?.severity === "high"
                            ? "cr-badge-high"
                            : latestCase.analysis?.severity === "medium"
                            ? "cr-badge-medium"
                            : "cr-badge-low"
                        }`}
                      >
                        {latestCase.analysis?.severity
                          ? `${latestCase.analysis.severity.toUpperCase()} PRIORITY`
                          : "PRIORITY"}
                      </span>

                      <span
                        className={`cr-badge ${
                          latestCase.confirmed
                            ? "cr-badge-submitted"
                            : "cr-badge-pending"
                        }`}
                      >
                        {latestCase.confirmed ? "SUBMITTED" : "PENDING"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="cr-badge cr-badge-high">
                        AI READY
                      </span>

                      <span className="cr-badge cr-badge-pending">
                        WAITING
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-6 text-white/60 text-xs">
                  {latestCase
                    ? "Latest complaint from your account"
                    : "Start by filing a complaint"}
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-[var(--cr-accent)] text-white p-3 rounded-xl shadow-xl">
                <div className="text-[10px] uppercase tracking-widest">
                  Routing
                </div>

                <div className="text-sm font-bold">
                  {latestCase ? "Live Data" : "Ready"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cr-container py-20">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-[var(--cr-accent)] font-bold">
            How it works
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mt-3 tracking-tight">
            Three steps from complaint to ministry.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: FileText,
              title: "Report",
              desc: "Describe the issue. Upload a photo and location.",
            },
            {
              icon: Brain,
              title: "Analyze",
              desc: "AI classifies severity and routes it correctly.",
            },
            {
              icon: Building2,
              title: "Submit",
              desc: "Confirm and receive tracking details instantly.",
            },
          ].map((s, i) => (
            <div key={s.title} className="cr-card p-7">
              <div className="w-10 h-10 rounded-lg bg-[var(--cr-primary)] text-white grid place-items-center mb-5">
                <s.icon size={20} />
              </div>

              <div className="text-xs uppercase tracking-widest text-[var(--cr-text-muted)] font-bold">
                Step 0{i + 1}
              </div>

              <h3 className="text-xl font-semibold mt-1">{s.title}</h3>

              <p className="text-[var(--cr-text-muted)] mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--cr-surface-2)] py-20">
        <div className="cr-container grid md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              k: "Secure",
              v: "Government-grade JWT authentication and encrypted storage.",
            },
            {
              icon: Map,
              k: "Localized",
              v: "Cases mapped to ministry catchments and SLAs.",
            },
            {
              icon: Sparkles,
              k: "Intelligent",
              v: "AI analyzes text and image evidence instantly.",
            },
          ].map((t) => (
            <div key={t.k} className="flex gap-4">
              <div className="w-10 h-10 rounded-md bg-[var(--cr-primary)] text-white grid place-items-center shrink-0">
                <t.icon size={18} />
              </div>

              <div>
                <div className="font-semibold">{t.k}</div>

                <div className="text-[var(--cr-text-muted)] mt-1">{t.v}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cr-container py-20">
        <div className="cr-card p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ready to make your community heard?
            </h3>

            <p className="text-[var(--cr-text-muted)] mt-2">
              File your first complaint in under a minute.
            </p>
          </div>

          <Link to={ctaTo} className="cr-btn-primary">
            Start now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}