"use client";

import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobCard } from "@/components/jobs/JobCard";
import {
  JobsFilterPanel,
  JOBS_FILTER_COUNTRIES,
} from "@/components/jobs/jobs-filter-panel";
import { JobsProfileMiniCard } from "@/components/jobs/jobs-profile-mini-card";
import { JobsSidebarFilterCard } from "@/components/jobs/jobs-sidebar-filter-card";
import { JobsSidebarSkillsPanel } from "@/components/jobs/jobs-sidebar-skills-panel";
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
import { JobsSearchBar } from "@/components/ui/jobs-search-bar";

/** Sync with grid: 1 col / sm 2 col / xl 3 col — use innerWidth (not only matchMedia) for reliable desktop sizing */
const JOBS_PAGE_SIZE_NARROW = 9;
const JOBS_PAGE_SIZE_TABLET = 10;
const JOBS_PAGE_SIZE_DESKTOP = 12;
const JOBS_PAGE_MIN_TABLET_PX = 768;
const JOBS_PAGE_MIN_XL_PX = 1280;

function jobsPageSizeForViewportWidth(width: number): number {
  if (width >= JOBS_PAGE_MIN_XL_PX) return JOBS_PAGE_SIZE_DESKTOP;
  if (width >= JOBS_PAGE_MIN_TABLET_PX) return JOBS_PAGE_SIZE_TABLET;
  return JOBS_PAGE_SIZE_NARROW;
}

export default function JobsPage() {
  const [jobsPageSize, setJobsPageSize] = useState(JOBS_PAGE_SIZE_NARROW);
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

  useLayoutEffect(() => {
    function apply() {
      setJobsPageSize(jobsPageSizeForViewportWidth(window.innerWidth));
    }
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
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

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPageSize));
  const page = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const visibleJobs = filteredJobs.slice((page - 1) * jobsPageSize, page * jobsPageSize);

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

  const filterPanelProps = {
    filters,
    onToggleCountry: toggleCountry,
    onToggleSector: toggleSector,
    onUpdateFilters: updateFilters,
  };

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
              <JobsFilterPanel {...filterPanelProps} />
            </div>
          )}

          {/* Mobile horizontal filter chips */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {JOBS_FILTER_COUNTRIES.map((c) => (
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <JobsSearchBar
              value={searchQuery}
              onValueChange={(v) => {
                setSearchQuery(v);
                setCurrentPage(1);
              }}
            />

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
              <Link
                href="/detail"
                className="inline-flex items-center justify-center h-9 px-7 rounded-lg font-jakarta text-xs font-medium text-ink-muted border border-ink/10 bg-white hover:bg-ink/5 hover:text-ink transition-colors whitespace-nowrap"
              >
                Get to know us
              </Link>
              <div className="flex bg-ink/10 border border-ink/10 rounded-lg overflow-hidden p-0">
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
          {user && <JobsProfileMiniCard user={user} />}

          {/* Skill match meter — data from JOBS (zenleap dummy), max 4 per page */}
          {user && (
            <JobsSidebarSkillsPanel
              skills={visibleSkills}
              skillTotalPages={skillTotalPages}
              skillCurrentPage={safeSkillPage}
              onSkillPageChange={setSkillPage}
            />
          )}

          <JobsSidebarFilterCard {...filterPanelProps} />
        </aside>
      </div>
    </AppLayout>
  );
}
