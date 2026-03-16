"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobCard } from "@/components/jobs/JobCard";
import { SkillBar } from "@/components/ui/SkillBar";
import { JOBS } from "@/lib/mock-data";
import {
  getUserProfile,
  initUserProfile,
  initQualifiedUsers,
  getFilters,
  setFilters as persistFilters,
} from "@/lib/storage";
import { useFunderMode } from "@/hooks/useFunderMode";
import type { UserProfile, FilterState } from "@/types";
import {
  FilterIcon,
  GridViewIcon,
  ListViewIcon,
  MoneyBag01Icon,
} from "hugeicons-react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { Pagination } from "@/components/ui/pagination";

const COUNTRIES = [
  "Germany", "Australia", "Austria", "Switzerland",
  "Japan", "South Korea", "Hong Kong SAR",
  "United Arab Emirates", "Singapore",
];
const SECTORS = ["Care Worker", "Healthcare", "Hospitality", "Construction", "Manufacturing", "Transportation", "IT"];

const PAGE_SIZE = 9;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { funderMode, toggleFunderMode, getCount, hydrated } = useFunderMode();

  useEffect(() => {
    const profile = initUserProfile();
    setUser(profile);
    const savedFilters = getFilters();
    setFiltersState(savedFilters);
    initQualifiedUsers();
  }, []);

  function updateFilters(updates: Partial<FilterState>) {
    const next = { ...filters, ...updates };
    setFiltersState(next);
    persistFilters(next);
    setCurrentPage(1);
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
    if (filters.skillMatchOnly && user) {
      jobs = jobs.filter((j) =>
        j.skillRequirements.every(
          (req) => (user.skills[req.skillName] ?? 0) >= req.requiredLevel
        )
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.country.toLowerCase().includes(q) ||
          j.sector.toLowerCase().includes(q) ||
          j.offTaker.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy === "skill_match" && user) {
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
  }, [filters, user, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const visibleJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Aggregate unique skills from JOBS (from zenleap dummy data), max requiredLevel per skill
  const allSkillsFromJobs = useMemo(() => {
    const map = new Map<string, number>();
    for (const job of JOBS) {
      for (const req of job.skillRequirements) {
        const current = map.get(req.skillName) ?? 0;
        map.set(req.skillName, Math.max(current, req.requiredLevel));
      }
    }
    return Array.from(map.keys()).map((skillName) => ({
      skillName,
      requiredLevel: 100,
      userLevel: user ? (user.skills[skillName] ?? 0) : 0,
    }));
  }, [user]);

  const SKILL_PAGE_SIZE = 4;
  const [skillPage, setSkillPage] = useState(1);
  const skillTotalPages = Math.max(1, Math.ceil(allSkillsFromJobs.length / SKILL_PAGE_SIZE));
  const safeSkillPage = Math.min(skillPage, skillTotalPages);
  const visibleSkills = allSkillsFromJobs.slice(
    (safeSkillPage - 1) * SKILL_PAGE_SIZE,
    safeSkillPage * SKILL_PAGE_SIZE
  );

  useEffect(() => {
    if (skillPage > skillTotalPages) setSkillPage(1);
  }, [skillTotalPages, skillPage]);

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
        filters.skillMatchOnly) && (
        <Button
          variant="light"
          color="primary"
          size="sm"
          onClick={() =>
            updateFilters({
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

  return (
    <AppLayout>
      <div className="flex gap-7 min-w-0 overflow-x-hidden">
        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0 w-full overflow-x-hidden">
          {/* Welcome bar */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="font-jakarta font-bold text-xl sm:text-2xl text-ink">
                Selamat datang, {user?.name?.split(" ")[0] ?? "PMI"}
              </h1>
              {hydrated && funderMode && (
                <p className="font-jakarta text-xs text-funded font-semibold mt-0.5">
                  Funder Mode aktif
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Funder mode toggle */}
              {hydrated && (
                <button
                  type="button"
                  onClick={toggleFunderMode}
                  className={`inline-flex items-center gap-1.5 font-jakarta text-xs font-semibold px-3 py-1.5 rounded-badge border transition-all duration-200 ${
                    funderMode
                      ? "bg-funded text-white border-funded shadow-sm"
                      : "bg-white text-ink-muted border-ink/15 hover:border-funded/50 hover:text-funded"
                  }`}
                >
                  <MoneyBag01Icon size={13} />
                  {funderMode ? "Funder" : "Funder Mode"}
                </button>
              )}
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
          </div>

          {/* Funder mode banner */}
          {hydrated && funderMode && (
            <div className="mb-4 flex items-center gap-2 bg-funded/8 border border-funded/20 rounded-card px-4 py-2.5">
              <span className="w-2 h-2 rounded-full bg-funded animate-pulse shrink-0" />
              <p className="font-jakarta text-xs text-funded-dark font-medium">
                Funder Mode — kartu lowongan menampilkan jumlah kandidat qualified dan estimasi dana yang dibutuhkan.
              </p>
            </div>
          )}

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

          {/* Search + View controls */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0 max-w-md">
              <input
                type="text"
                placeholder="Cari lowongan, negara, sektor..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full font-jakarta text-sm bg-white border border-ink/10 rounded-lg px-4 py-2 text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="flex bg-ink/10 border border-ink/10 rounded-lg overflow-hidden shrink-0 p-0">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => updateFilters({ viewMode: "grid" })}
                className={`flex-1 flex items-center justify-center min-w-[36px] h-9 rounded-l-lg transition-colors ${
                  filters.viewMode === "grid"
                    ? "bg-primary text-white"
                    : "bg-white text-ink-muted hover:text-ink"
                }`}
              >
                <GridViewIcon size={14} />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => updateFilters({ viewMode: "list" })}
                className={`flex-1 flex items-center justify-center min-w-[36px] h-9 rounded-r-lg transition-colors ${
                  filters.viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-white text-ink-muted hover:text-ink"
                }`}
              >
                <ListViewIcon size={14} />
              </button>
            </div>
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
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch min-w-0"
                    : "flex flex-col gap-4 min-w-0"
                }
              >
                {visibleJobs.map((job) => {
                  const qualifiedCount = hydrated ? getCount(job.id) : 0;
                  const funderData =
                    funderMode && hydrated
                      ? { qualifiedCount, fundingNeeded: qualifiedCount * job.salaryMin }
                      : undefined;
                  return (
                    <div key={job.id} className={filters.viewMode === "grid" ? "h-full min-h-0" : undefined}>
                      <JobCard job={job} viewMode={filters.viewMode} funderData={funderData} />
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 min-w-0 overflow-hidden">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
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
            </div>
          )}

          {/* Skill match meter — data from JOBS (zenleap dummy), max 4 per page */}
          {user && (
            <div className="bg-white border border-ink/10 rounded-card p-4 min-w-0 overflow-hidden">
              <h3 className="font-jakarta font-semibold text-[10px] uppercase tracking-widest text-ink-muted mb-4">
                Skill Kamu
              </h3>
              <div className="space-y-4 min-w-0 overflow-hidden">
                {visibleSkills.map((skill) => (
                  <SkillBar
                    key={skill.skillName}
                    skillName={skill.skillName}
                    userLevel={skill.userLevel}
                    requiredLevel={skill.requiredLevel}
                    showGapPill
                    showZenLeapLink
                  />
                ))}
              </div>
              {skillTotalPages > 1 && (
                <div className="mt-4 min-w-0 overflow-hidden">
                  <Pagination
                    currentPage={safeSkillPage}
                    totalPages={skillTotalPages}
                    onPageChange={setSkillPage}
                    compact
                  />
                </div>
              )}
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
