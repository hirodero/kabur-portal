"use client";

import { useState, useEffect } from "react";
import { UserAdd01Icon } from "hugeicons-react";
import { getFunderMode, getQualifiedUsers } from "@/lib/storage";

interface QualificationsPanelProps {
  jobId: string;
  qualifications: string[];
}

export function QualificationsPanel({ jobId, qualifications }: QualificationsPanelProps) {
  const [funderMode, setFunderMode] = useState(false);
  const [qualifiedCount, setQualifiedCount] = useState(0);

  useEffect(() => {
    setFunderMode(getFunderMode());
    const stored = getQualifiedUsers();
    setQualifiedCount(stored[jobId] ?? 0);
  }, [jobId]);

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
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
            <span className="font-jakarta text-sm text-ink-muted leading-snug">{q}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
