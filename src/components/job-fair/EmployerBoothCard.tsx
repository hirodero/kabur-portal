"use client";

import { FundingBadge } from "@/components/ui/FundingBadge";
import { Button } from "@heroui/react";
import type { JobFairEmployer } from "@/types";

interface EmployerBoothCardProps {
  employer: JobFairEmployer;
  onVisit: (employer: JobFairEmployer) => void;
}

const SECTOR_BORDER_COLORS: Record<string, string> = {
  "Care Worker": "#3B82F6",
  Hospitality: "#8B5CF6",
  Construction: "#F97316",
  Manufacturing: "#6B7280",
  IT: "#16A34A",
};

const SECTOR_TEXT_COLORS: Record<string, string> = {
  "Care Worker": "text-blue-700 bg-blue-50",
  Hospitality: "text-purple-700 bg-purple-50",
  Construction: "text-orange-700 bg-orange-50",
  Manufacturing: "text-gray-700 bg-gray-100",
  IT: "text-green-700 bg-green-50",
};

export function EmployerBoothCard({ employer, onVisit }: EmployerBoothCardProps) {
  const sectorBorder = SECTOR_BORDER_COLORS[employer.sector] ?? "#6B7280";
  const sectorText = SECTOR_TEXT_COLORS[employer.sector] ?? "text-gray-700 bg-gray-100";

  return (
    <div
      className="bg-white border border-ink/10 rounded-card p-5 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 flex flex-col"
      style={{ borderLeftWidth: '3px', borderLeftColor: sectorBorder }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-jakarta font-semibold text-sm text-ink leading-snug">
            {employer.name}
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            {employer.countryFlag} {employer.country}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-badge font-medium ${sectorText}`}>
            {employer.sector}
          </span>
          {employer.isFunded && <FundingBadge />}
        </div>
      </div>

      {/* Position count */}
      <div className="mb-3">
        <span className="font-jakarta font-bold text-sm text-primary">
          {employer.jobCount} posisi tersedia
        </span>
      </div>

      {/* Job titles */}
      <ul className="space-y-1 mb-4 flex-1">
        {employer.jobTitles.slice(0, 3).map((title) => (
          <li key={title} className="text-xs text-ink-muted flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-ink/20 shrink-0" />
            {title}
          </li>
        ))}
        {employer.jobTitles.length > 3 && (
          <li className="text-xs text-ink-muted italic">
            +{employer.jobTitles.length - 3} posisi lainnya
          </li>
        )}
      </ul>

      {/* CTA */}
      <Button
        variant="light"
        color="primary"
        size="sm"
        onClick={() => onVisit(employer)}
        className="text-xs font-medium min-w-0 h-auto p-0 justify-start text-left hover:underline"
      >
        Kunjungi Booth →
      </Button>
    </div>
  );
}
