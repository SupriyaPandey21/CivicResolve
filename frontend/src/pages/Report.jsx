import React from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api, { formatApiErrorDetail } from "../lib/api";

import {
  Camera,
  MapPin,
  Hammer,
  Droplets,
  Trash2,
  Lightbulb,
  Loader2,
  ArrowRight,
} from "lucide-react";

const QUICK_CATS = [
  { key: "Roads", icon: Hammer },
  { key: "Water", icon: Droplets },
  { key: "Waste", icon: Trash2 },
  { key: "Lighting", icon: Lightbulb },
];

export default function Report() {
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [step, setStep] = useState(1);
  const [cat, setCat] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState(null);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onPickFile = async (e) => {
    const f = e.target.files?.[0];

    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto({
        dataUrl: reader.result,
        mime: f.type,
        name: f.name,
      });
    };

    reader.readAsDataURL(f);
  };

  const submit = async () => {
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/grievances/analyze", {
        description: desc,
        category_hint: cat || null,
        location: location || null,
        photo_base64: photo?.dataUrl || null,
        photo_mime: photo?.mime || null,
      });

      nav(`/analysis/${res.data.id}`, {
        state: { grievance: res.data },
      });
    } catch (err) {
      setError(
        formatApiErrorDetail(err.response?.data?.detail) || err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canNext1 = desc.trim().length >= 10;
  const canSubmit = canNext1 && !submitting;

  return (
    <div className="cr-container py-10 cr-fade-up">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Report an issue
        </h1>

        <p className="text-[var(--cr-text-muted)] mt-2">
          Help us maintain our city. Provide details, our AI will categorize
          and route it to the right ministry.
        </p>

        {/* Stepper */}
        <div className="flex items-center gap-3 mt-8 mb-8">
          {[
            { n: 1, label: "Details" },
            { n: 2, label: "Location" },
            { n: 3, label: "Review" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full grid place-items-center font-bold text-sm ${
                  step === s.n
                    ? "cr-step-active"
                    : step > s.n
                    ? "cr-step-done"
                    : "cr-step-idle"
                }`}
              >
                {s.n}
              </div>

              <div
                className={`text-sm font-semibold ${
                  step >= s.n ? "" : "text-[var(--cr-text-muted)]"
                }`}
              >
                {s.label}
              </div>

              {i < 2 && (
                <div className="w-10 h-px bg-[var(--cr-border-strong)] mx-1" />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="cr-badge cr-badge-high mb-5 px-3 py-2 w-full justify-start">
            {error}
          </div>
        )}

        <div className="cr-card p-7 md:p-9">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="text-xs uppercase tracking-widest font-bold mb-3">
                Quick Select Category
              </div>

              <div className="flex flex-wrap gap-2 mb-7">
                {QUICK_CATS.map(({ key, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCat(key === cat ? "" : key)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${
                      cat === key
                        ? "bg-[var(--cr-primary)] text-white border-[var(--cr-primary)]"
                        : "bg-white text-[var(--cr-text)] border-[var(--cr-border-strong)] hover:border-[var(--cr-primary)]"
                    }`}
                  >
                    <Icon size={16} />
                    {key}
                  </button>
                ))}
              </div>

              <label className="text-xs uppercase tracking-widest font-bold">
                What's the problem?
              </label>

              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 500))}
                className="cr-input mt-2"
                placeholder="Describe the issue in detail."
              />

              <div className="text-right text-xs text-[var(--cr-text-muted)] mt-1">
                {desc.length} / 500
              </div>

              <div className="mt-6 flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={onPickFile}
                />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="cr-btn-outline"
                >
                  <Camera size={18} />
                  {photo ? "Replace Photo" : "Upload Photo"}
                </button>

                <span className="text-xs text-[var(--cr-text-muted)]">
                  Max 5MB · JPG, PNG, WEBP
                </span>
              </div>

              {photo && (
  <div className="mt-4">
    <img
      src={photo.dataUrl}
      alt="evidence"
      className="rounded-lg border border-[var(--cr-border)] max-h-64"
    />

    <button
      type="button"
      onClick={() => {
        setPhoto(null);
        if (fileRef.current) {
          fileRef.current.value = "";
        }
      }}
      className="mt-3 text-sm font-semibold text-[var(--cr-error)] underline"
    >
      Remove Photo
    </button>
  </div>
)}

              <div className="flex justify-end mt-8">
                <button
                  disabled={!canNext1}
                  onClick={() => setStep(2)}
                  className="cr-btn-primary"
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <label className="text-xs uppercase tracking-widest font-bold">
                Location (optional)
              </label>

              <div className="mt-2 flex items-center gap-2">
                <MapPin
                  size={18}
                  className="text-[var(--cr-text-muted)]"
                />

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="cr-input"
                  placeholder="e.g. 4th & Madison St"
                />
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="cr-btn-outline"
                >
                  Back
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="cr-btn-primary"
                >
                  Review
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Review your report
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-bold">Category</div>
                  <div>{cat || "—"}</div>
                </div>

                <div>
                  <div className="font-bold">Description</div>
                  <div>{desc}</div>
                </div>

                <div>
                  <div className="font-bold">Location</div>
                  <div>{location || "—"}</div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="cr-btn-outline"
                >
                  Back
                </button>

                <button
                  onClick={submit}
                  disabled={!canSubmit}
                  className="cr-btn-primary"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Problem
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}