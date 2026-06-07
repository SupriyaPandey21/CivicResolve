import React from "react";
import { useEffect, useState } from "react";

import api from "../lib/api";

import {
  Search,
  Phone,
  Globe,
  Building2,
  Trees,
  Bus,
  Stethoscope,
  Scale,
  Wallet,
  Droplets,
  HardHat,
} from "lucide-react";

const ICONS = {
  Building2,
  Trees,
  Bus,
  Stethoscope,
  Scale,
  Wallet,
  Droplets,
  HardHat,
};

export default function Ministries() {
  const [list, setList] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    api
      .get("/ministries")
      .then((r) => setList(r.data))
      .catch(() => setList([]));
  }, []);

  const safeList = Array.isArray(list) ? list : [];

const cats = [
  "All",
  ...Array.from(new Set(safeList.map((m) => m.category))),
];

const filtered = safeList.filter(
    (m) =>
      (cat === "All" || m.category === cat) &&
      (q === "" ||
        m.name.toLowerCase().includes(q.toLowerCase()) ||
        m.description.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="cr-container py-10 cr-fade-up">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        Ministry Directory
      </h1>

      <p className="text-[var(--cr-text-muted)] mt-2 max-w-2xl">
        Access contacts and responsibilities of government departments.
        Use the search to find the right office.
      </p>

      {/* Search + Categories */}
      <div className="mt-7 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cr-text-muted)]"
          />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or service..."
            className="cr-input !pl-14"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap ${
                cat === c
                  ? "bg-[var(--cr-primary)] text-white border-[var(--cr-primary)]"
                  : "bg-white text-[var(--cr-text)] border-[var(--cr-border-strong)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
         
      {list === null && (
  <div className="mt-10 text-[var(--cr-text-muted)]">
    Loading ministries...
  </div>
)} 
      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {filtered.map((m) => {
          const Icon = ICONS[m.icon] || Building2;

          return (
            <div
              key={m.id}
              className="cr-card p-6 flex flex-col"
            >
              <div className="w-10 h-10 rounded-md bg-[var(--cr-primary)] text-white grid place-items-center mb-4">
                <Icon size={20} />
              </div>

              <h3 className="text-lg font-semibold leading-tight">
                {m.name}
              </h3>

              <p className="text-sm text-[var(--cr-text-muted)] mt-2 flex-1">
                {m.description}
              </p>

              <div className="mt-5 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-[var(--cr-text)]">
                  <Phone size={14} />
                  {m.phone}
                </div>

                <div className="flex items-center gap-2 text-[var(--cr-text)]">
                  <Globe size={14} />
                  {m.website}
                </div>
              </div>

              <div className="mt-4 inline-flex">
                <span className="cr-badge cr-badge-low">
                  SLA · {m.response_time}
                </span>
              </div>
            </div>
          );
        })}

        {list !== null && filtered.length === 0 && (
          <div className="col-span-full text-center text-[var(--cr-text-muted)] py-12">
            No ministries match your search.
          </div>
        )}
      </div>
    </div>
  );
}