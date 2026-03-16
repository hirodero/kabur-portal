"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobCard } from "@/components/jobs/JobCard";
import { MPChannelBanner } from "@/components/mp/MPChannelBanner";
import { SkillBar } from "@/components/ui/SkillBar";
import { JOBS } from "@/lib/mock-data";
import {
  getUserProfile,
  initUserProfile,
  getFilters,
  setFilters as persistFilters,
} from "@/lib/storage";
import type { UserProfile, FilterState } from "@/types";
import {
  FilterIcon,
  GridViewIcon,
  ListViewIcon,
  ArrowRight01Icon,
} from "hugeicons-react";
import Link from "next/link";
import { Button, ButtonGroup } from "@heroui/react";

const COUNTRIES = ["Jepang", "Korea Selatan", "Hong Kong", "UAE", "Singapura"];
const SECTORS = ["Care Worker", "Hospitality", "Construction", "Manufacturing", "IT"];
const SORT_OPTIONS = [
  { value: "latest", label: "Terbaru" },
  { value: "skill_match", label: "Skill match" },
  { value: "funded_first", label: "Funded first" },
] as const;

const PAGE_SIZE = 6;

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [filters, setFiltersState] = useState<FilterState>({
    countries: [],
    sectors: [],
    fundedOnly: false,
    skillMatchOnly: false,
    sortBy: "latest",
    viewMode: "grid",
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const profile = initUserProfile();
    setUser(profile);
    const savedFilters = getFilters();
    setFiltersState(savedFilters);
  }, []);

  function updateFilters(updates: Partial<FilterState>) {
    const next = { ...filters, ...updates };
    setFiltersState(next);
    persistFilters(next);
    setVisibleCount(PAGE_SIZE);
  }

  function toggleCountry(country: string) {
    const next = filters.countries.includes(country)
      ? filters.countries.filter((c) => c !== country)
      : [...filters.countries, country];
    updateFilters({ countries: next });
  }

  function toggleSector(sector: string) {
    const next = filters.sectors.includes(sector)
      ? filters.sectors.filter((s) => s !== sector)
      : [...filters.sectors, sector];
    updateFilters({ sectors: next });
  }

  const filteredJobs = useMemo(() => {
    let jobs = [...JOBS];

    if (filters.countries.length > 0)
      jobs = jobs.filter((j) => filters.countries.includes(j.country));
    if (filters.sectors.length > 0)
      jobs = jobs.filter((j) => filters.sectors.includes(j.sector));
    if (filters.fundedOnly) jobs = jobs.filter((j) => j.isFunded);
    if (filters.skillMatchOnly && user) {
      jobs = jobs.filter((j) =>
        j.skillRequirements.every(
          (req) => (user.skills[req.skillName] ?? 0) >= req.requiredLevel
        )
      );
    }

    if (filters.sortBy === "funded_first") {
      jobs = [...jobs].sort((a, b) => (b.isFunded ? 1 : 0) - (a.isFunded ? 1 : 0));
    } else if (filters.sortBy === "skill_match" && user) {
      jobs = [...jobs].sort((a, b) => {
        const score = (j: (typeof JOBS)[0]) => {
          const reqs = j.skillRequirements;
          if (reqs.length === 0) return 0;
          return (
            reqs.filter((r) => (user.skills[r.skillName] ?? 0) >= r.requiredLevel)
              .length / reqs.length
          );
        };
        return score(b) - score(a);
      });
    } else {
      jobs = [...jobs].sort(
        (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      );
    }

    return jobs;
  }, [filters, user]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  const SKILL_TARGETS: Record<string, number> = {
    "Basic Thinking Skills": 70,
    "Understanding and Be Effective with Others": 80,
    "Basic Decision-Making": 65,
    "Productivity and Management Skills": 65,
    "Business and Economics for Everyone": 60,
    "Communication in Japanese/Korean/English": 70,
  };

  const userSkillEntries = user ? Object.entries(user.skills).slice(0, 4) : [];

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Countries */}
      <div>
        <h4 className="font-jakarta font-semibold text-[10px] uppercase tracking-widest text-ink-muted mb-3">
          Negara Tujuan
        </h4>
        <div className="space-y-2">
          {COUNTRIES.map((c) => (
            <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.countries.includes(c)}
                onChange={() => toggleCountry(c)}
                className="accent-primary w-3.5 h-3.5 rounded"
              />
              <span className="font-jakarta text-sm text-ink-muted group-hover:text-ink transition-colors">
                {c}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sectors */}
      <div>
        <h4 className="font-jakarta font-semibold text-[10px] uppercase tracking-widest text-ink-muted mb-3">
          Sektor
        </h4>
        <div className="space-y-2">
          {SECTORS.map((s) => (
            <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.sectors.includes(s)}
                onChange={() => toggleSector(s)}
                className="accent-primary w-3.5 h-3.5"
              />
              <span className="font-jakarta text-sm text-ink-muted group-hover:text-ink transition-colors">
                {s}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-3 border-t border-ink/8">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-jakarta text-sm text-ink font-medium">Funded only</span>
          <div
            onClick={() => updateFilters({ fundedOnly: !filters.fundedOnly })}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
              filters.fundedOnly ? "bg-primary" : "bg-ink/15"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                filters.fundedOnly ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-jakarta text-sm text-ink font-medium">Skill-matched</span>
          <div
            onClick={() => updateFilters({ skillMatchOnly: !filters.skillMatchOnly })}
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

      {/* Reset */}
      {(filters.countries.length > 0 ||
        filters.sectors.length > 0 ||
        filters.fundedOnly ||
        filters.skillMatchOnly) && (
        <Button
          variant="light"
          color="primary"
          size="sm"
          onClick={() =>
            updateFilters({
              countries: [],
              sectors: [],
              fundedOnly: false,
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

  return (
    <AppLayout>
      <div className="flex gap-7">
        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0 w-full">
          {/* Welcome bar */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="font-jakarta font-bold text-xl sm:text-2xl text-ink">
                Selamat datang, {user?.name?.split(" ")[0] ?? "PMI"}
              </h1>
              <p className="font-jakarta text-sm text-ink-muted mt-1">
                {filteredJobs.length} lowongan tersedia untuk kamu
              </p>
            </div>
            {/* Mobile filter toggle */}
            <Button
              variant="bordered"
              size="sm"
              className="lg:hidden font-jakarta"
              startContent={<FilterIcon size={14} />}
              onClick={() => setMobileFiltersOpen((v) => !v)}
            >
              Filter
            </Button>
          </div>

          {/* Mobile filters panel */}
          {mobileFiltersOpen && (
            <div className="lg:hidden bg-white border border-ink/10 rounded-card p-4 mb-5">
              <FilterPanel />
            </div>
          )}

          {/* Mobile horizontal filter chips */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {COUNTRIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={filters.countries.includes(c) ? "solid" : "bordered"}
                color={filters.countries.includes(c) ? "primary" : "default"}
                className="shrink-0 font-jakarta text-xs"
                onClick={() => toggleCountry(c)}
              >
                {c}
              </Button>
            ))}
          </div>

          {/* MP Channel Banner */}
          <MPChannelBanner />

          {/* Sort + View controls */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={filters.sortBy === opt.value ? "solid" : "bordered"}
                  color={filters.sortBy === opt.value ? "primary" : "default"}
                  className="font-jakarta text-xs min-w-0"
                  onClick={() => updateFilters({ sortBy: opt.value })}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <ButtonGroup variant="flat" size="sm" className="gap-0 p-0.5 bg-white border border-ink/10 rounded-lg overflow-hidden">
              <Button
                isIconOnly
                size="sm"
                variant={filters.viewMode === "grid" ? "solid" : "light"}
                color={filters.viewMode === "grid" ? "primary" : "default"}
                aria-label="Grid view"
                onClick={() => updateFilters({ viewMode: "grid" })}
              >
                <GridViewIcon size={14} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant={filters.viewMode === "list" ? "solid" : "light"}
                color={filters.viewMode === "list" ? "primary" : "default"}
                aria-label="List view"
                onClick={() => updateFilters({ viewMode: "list" })}
              >
                <ListViewIcon size={14} />
              </Button>
            </ButtonGroup>
          </div>

          {/* Results count */}
          <p className="font-jakarta text-xs text-ink-muted mb-4">
            {filteredJobs.length} lowongan ditemukan
          </p>

          {/* Job grid */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 text-ink-muted">
              <p className="font-jakarta text-lg font-semibold mb-2 text-ink">
                Tidak ada lowongan
              </p>
              <p className="font-jakarta text-sm">Coba ubah filter pencarian kamu.</p>
            </div>
          ) : (
            <>
              <div
                className={
                  filters.viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch"
                    : "flex flex-col gap-4"
                }
              >
                {visibleJobs.map((job, idx) => (
                  <Fragment key={job.id}>
                    <div className={filters.viewMode === "grid" ? "h-full min-h-0" : undefined}>
                      <JobCard job={job} viewMode={filters.viewMode} />
                    </div>
                    {/* Job Fair CTA card at position 3 */}
                    {idx === 2 && (
                      <div
                        key="jf-cta"
                        className={`rounded-xl flex relative overflow-hidden ${
                          filters.viewMode === "grid"
                            ? "h-full min-h-[274px] flex-col justify-between p-5"
                            : "min-h-[81px] flex-row items-center justify-between gap-4 px-5 py-3"
                        }`}
                        style={{ background: 'linear-gradient(135deg, #8B0000 0%, #6B0000 100%)' }}
                      >
                        <div className={filters.viewMode === "grid" ? "" : "flex flex-col gap-0.5 flex-1 min-w-0"}>
                          <span className="font-jakarta text-[10px] font-bold text-white/60 uppercase tracking-widest">
                            Event Mendatang
                          </span>
                          <h3 className="font-jakarta font-bold text-white text-base leading-snug">
                            Job Fair Internasional Q1 2025
                          </h3>
                          <p className="font-jakarta text-xs text-white/70">
                            15–17 April · 38 Employer · 240+ Posisi
                          </p>
                        </div>
                        <Link
                          href="/job-fair"
                          className={`inline-flex items-center gap-1.5 font-jakarta text-xs font-semibold text-white hover:underline shrink-0 ${
                            filters.viewMode === "grid" ? "mt-4" : ""
                          }`}
                        >
                          Lihat Job Fair <ArrowRight01Icon size={13} />
                        </Link>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    variant="bordered"
                    color="default"
                    onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                    className="font-jakarta"
                  >
                    Muat lebih banyak ({filteredJobs.length - visibleCount} tersisa)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT SIDEBAR (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-4">
          {/* Profile mini-card */}
          {user && (
            <div className="bg-white border border-ink/10 rounded-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-primary rounded-card flex items-center justify-center text-white font-jakarta font-bold text-xs shrink-0">
                  {user.initials}
                </div>
                <div>
                  <p className="font-jakarta font-semibold text-sm text-ink">{user.name}</p>
                  <p className="font-jakarta text-xs text-ink-muted">{user.location}</p>
                </div>
              </div>
              {user.mpReferral && (
                <div className="text-[10px] bg-primary-light text-primary border border-primary/20 rounded-badge px-2 py-1 text-center font-jakarta font-medium">
                  via {user.mpReferral.charAt(0).toUpperCase() + user.mpReferral.slice(1)}
                </div>
              )}
            </div>
          )}

          {/* Skill match meter */}
          {user && (
            <div className="bg-white border border-ink/10 rounded-card p-4">
              <h3 className="font-jakarta font-semibold text-[10px] uppercase tracking-widest text-ink-muted mb-4">
                Skill Kamu
              </h3>
              <div className="space-y-4">
                {userSkillEntries.map(([skillName, level]) => (
                  <SkillBar
                    key={skillName}
                    skillName={skillName}
                    userLevel={level}
                    requiredLevel={SKILL_TARGETS[skillName] ?? 70}
                    showGapPill={false}
                    showZenLeapLink={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filter panel */}
          <div className="bg-white border border-ink/10 rounded-card p-4">
            <h3 className="font-jakarta font-semibold text-[10px] uppercase tracking-widest text-ink-muted mb-4">
              Filter
            </h3>
            <FilterPanel />
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
