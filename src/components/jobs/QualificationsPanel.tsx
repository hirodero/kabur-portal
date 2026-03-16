"use client";

import { useState, useEffect } from "react";
import { CheckmarkSquare01Icon, SquareIcon, UserAdd01Icon } from "hugeicons-react";
import { getFunderMode, addQualifiedUser, getQualifiedUsers } from "@/lib/storage";

interface QualificationsPanelProps {
  jobId: string;
  qualifications: string[];
}

function formatRupiahCompact(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function QualificationsPanel({ jobId, qualifications }: QualificationsPanelProps) {
  const [funderMode, setFunderMode] = useState(false);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [qualifiedCount, setQualifiedCount] = useState(0);
  const [justConfirmed, setJustConfirmed] = useState(false);

  useEffect(() => {
    setFunderMode(getFunderMode());
    setChecked(new Array(qualifications.length).fill(false));
    const stored = getQualifiedUsers();
    setQualifiedCount(stored[jobId] ?? 0);
  }, [jobId, qualifications.length]);

  // Listen for funder mode changes from home page (via storage events)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "pmi_funder_mode") {
        setFunderMode(e.newValue === "true");
      }
      if (e.key === "pmi_qualified_users" && e.newValue) {
        const parsed = JSON.parse(e.newValue) as Record<string, number>;
        setQualifiedCount(parsed[jobId] ?? 0);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [jobId]);

  const allChecked = checked.length > 0 && checked.every(Boolean);
  const someChecked = checked.some(Boolean);

  function toggleCheck(idx: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  }

  function handleConfirm() {
    const newCount = addQualifiedUser(jobId);
    setQualifiedCount(newCount);
    setChecked(new Array(qualifications.length).fill(false));
    setJustConfirmed(true);
    setTimeout(() => setJustConfirmed(false), 2500);
  }

  return (
    <div className="bg-white border border-ink/10 rounded-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-jakarta font-bold text-lg text-ink">Kualifikasi</h2>

        {funderMode && qualifiedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-jakarta font-semibold px-2.5 py-1 rounded-badge bg-funded/10 text-funded border border-funded/20">
            <UserAdd01Icon size={12} />
            {qualifiedCount} kandidat qualified
          </span>
        )}
      </div>

      <ul className="space-y-2.5">
        {qualifications.map((q, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            {funderMode ? (
              <button
                type="button"
                onClick={() => toggleCheck(idx)}
                className="mt-0.5 shrink-0 text-funded transition-transform active:scale-90"
                aria-label={checked[idx] ? "Uncheck" : "Check"}
              >
                {checked[idx] ? (
                  <CheckmarkSquare01Icon size={16} className="text-funded" />
                ) : (
                  <SquareIcon size={16} className="text-ink-faint" />
                )}
              </button>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
            )}
            <span
              className={`font-jakarta text-sm leading-snug transition-colors ${
                funderMode && checked[idx] ? "text-ink line-through-none" : "text-ink-muted"
              }`}
            >
              {q}
            </span>
          </li>
        ))}
      </ul>

      {/* Funder mode: confirm button */}
      {funderMode && (
        <div className="mt-4 pt-4 border-t border-ink/8">
          {justConfirmed ? (
            <div className="flex items-center gap-2 text-funded font-jakarta text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-funded animate-pulse" />
              Kandidat #{qualifiedCount} berhasil dikonfirmasi!
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="font-jakarta text-xs text-ink-muted">
                {allChecked
                  ? "Semua kualifikasi terpenuhi — konfirmasi kandidat ini?"
                  : someChecked
                  ? `${checked.filter(Boolean).length}/${qualifications.length} kualifikasi terpenuhi`
                  : "Centang kualifikasi yang terpenuhi oleh kandidat"}
              </p>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!allChecked}
                className="shrink-0 inline-flex items-center gap-1.5 font-jakarta text-xs font-semibold px-3 py-1.5 rounded-badge bg-funded text-white hover:bg-funded-dark transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <UserAdd01Icon size={13} />
                Konfirmasi Qualified
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
