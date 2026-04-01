"use client";

import { Button } from "@heroui/react";
import type { FilterState } from "@/types";

export const JOBS_FILTER_COUNTRIES = [
  "Germany", "Australia", "Austria", "Switzerland",
  "Japan", "South Korea", "Hong Kong SAR",
  "United Arab Emirates", "Singapore",
];

export const JOBS_FILTER_SECTORS = [
  "Care Worker", "Healthcare", "Hospitality", "Construction", "Manufacturing", "Transportation", "IT",
];

export interface JobsFilterPanelProps {
  filters: FilterState;
  onToggleCountry: (country: string) => void;
  onToggleSector: (sector: string) => void;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
}

export function JobsFilterPanel({
  filters,
  onToggleCountry,
  onToggleSector,
  onUpdateFilters,
}: JobsFilterPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-jakarta font-semibold text-[10px] uppercase tracking-widest text-ink-muted mb-3">
          Negara Tujuan
        </h4>
        <div className="space-y-2">
          {JOBS_FILTER_COUNTRIES.map((c) => (
            <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.countries.includes(c)}
                onChange={() => onToggleCountry(c)}
                className="accent-primary w-3.5 h-3.5 rounded"
              />
              <span className="font-jakarta text-sm text-ink-muted group-hover:text-ink transition-colors">
                {c}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-jakarta font-semibold text-[10px] uppercase tracking-widest text-ink-muted mb-3">
          Sektor
        </h4>
        <div className="space-y-2">
          {JOBS_FILTER_SECTORS.map((s) => (
            <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.sectors.includes(s)}
                onChange={() => onToggleSector(s)}
                className="accent-primary w-3.5 h-3.5"
              />
              <span className="font-jakarta text-sm text-ink-muted group-hover:text-ink transition-colors">
                {s}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-ink/8">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-jakarta text-sm text-ink font-medium">Skill-matched</span>
          <div
            onClick={() => onUpdateFilters({ skillMatchOnly: !filters.skillMatchOnly })}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
              filters.skillMatchOnly ? "bg-primary" : "bg-ink/15"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                filters.skillMatchOnly ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
        </label>
      </div>

      {(filters.countries.length > 0 ||
        filters.sectors.length > 0 ||
        filters.skillMatchOnly) && (
        <Button
          variant="light"
          color="primary"
          size="sm"
          onClick={() =>
            onUpdateFilters({
              countries: [],
              sectors: [],
              skillMatchOnly: false,
            })
          }
          className="font-jakarta text-xs min-w-0 h-auto p-0 underline"
        >
          Reset semua filter
        </Button>
      )}
    </div>
  );
}
