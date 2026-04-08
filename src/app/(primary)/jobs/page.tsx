"use client";

import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobCard } from "@/components/jobs/JobCard";
import { JOBS } from "@/lib/mock-data";
import {
  initUserProfile,
  initQualifiedUsers,
  getFilters,
  setFilters as persistFilters,
} from "@/lib/storage";
import { useFunderMode } from "@/hooks/useFunderMode";
import type { UserProfile, FilterState } from "@/types";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { ArrowDown01Icon } from "hugeicons-react";
import { InfiniteMovingLogos } from "@/components/ui/infinite-moving-logos";
import { Globe } from "@/components/ui/Globe";

/** Sync with grid: 1 col / sm 2 col / xl 3 col — use innerWidth (not only matchMedia) for reliable desktop sizing */
const JOBS_PAGE_SIZE_NARROW = 9;
const JOBS_PAGE_SIZE_TABLET = 10;
const JOBS_PAGE_SIZE_DESKTOP = 12;
const JOBS_PAGE_MIN_TABLET_PX = 768;
const JOBS_PAGE_MIN_XL_PX = 1280;
const JOBS_QUICK_COUNTRY_FILTERS = ["Japan", "South Korea", "Germany", "Singapore", "United Arab Emirates"];
const MARKETING_PARTNER_LOGOS: Record<string, string> = {
  APJATI: "/apjati-logo.png",
  Vokati: "/vokati-logo.png",
  zenius: "/zenius.png",
  telkomsel: "/telkomsel.png",
  malaka: "/malaka.png",
};

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
  const [isFilterRowOpen, setIsFilterRowOpen] = useState(false);

  useEffect(() => {
    const profile = initUserProfile();
    setUser(profile);
    const savedFilters = getFilters();
    setFiltersState({ ...savedFilters, viewMode: "grid" });
    initQualifiedUsers();
  }, []);
  const {
    funderMode,
    canUseFunderMode,
    getCount,
    hydrated,
  } = useFunderMode({ role: user?.role ?? "candidate" });

  useLayoutEffect(() => {
    function apply() {
      setJobsPageSize(jobsPageSizeForViewportWidth(window.innerWidth));
    }
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    function onToggleFilterRow() {
      setIsFilterRowOpen((open) => !open);
    }
    window.addEventListener("jobs:toggle-filter-row", onToggleFilterRow as EventListener);
    return () => window.removeEventListener("jobs:toggle-filter-row", onToggleFilterRow as EventListener);
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
    if (filters.fundedOnly)
      jobs = jobs.filter((j) => j.isFunded);
    if (filters.skillMatchOnly && user) {
      jobs = jobs.filter((j) =>
        j.skillRequirements.every(
          (req) => (user.skills[req.skillName] ?? 0) >= req.requiredLevel
        )
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
  }, [filters, user]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPageSize));
  const page = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const visibleJobs = filteredJobs.slice((page - 1) * jobsPageSize, page * jobsPageSize);

  const hasActiveQuickCountry =
    filters.countries.length === 1 && JOBS_QUICK_COUNTRY_FILTERS.includes(filters.countries[0]);
  const countryOptions = useMemo(
    () => Array.from(new Set(JOBS.map((job) => job.country))).sort((a, b) => a.localeCompare(b)),
    []
  );
  const sectorOptions = useMemo(
    () => Array.from(new Set(JOBS.map((job) => job.sector))).sort((a, b) => a.localeCompare(b)),
    []
  );
  const trustedPartnerItems = useMemo(() => {
    const seen = new Set<string>();
    const items: Array<{ src: string; alt: string }> = [];

    for (const job of JOBS) {
      const offTakerLogo = MARKETING_PARTNER_LOGOS[job.offTaker];
      if (offTakerLogo && !seen.has(job.offTaker)) {
        seen.add(job.offTaker);
        items.push({ src: offTakerLogo, alt: job.offTaker });
      }

      if (job.mpChannel) {
        const channelLogo = MARKETING_PARTNER_LOGOS[job.mpChannel];
        if (channelLogo && !seen.has(job.mpChannel)) {
          seen.add(job.mpChannel);
          items.push({ src: channelLogo, alt: job.mpChannel });
        }
      }
    }

    return items;
  }, []);
  const marqueeItems = useMemo(() => {
    if (trustedPartnerItems.length === 0) return trustedPartnerItems;
    const minBaseItems = 18;
    const repeatCount = Math.max(1, Math.ceil(minBaseItems / trustedPartnerItems.length));
    return Array.from({ length: repeatCount }).flatMap((_, index) =>
      trustedPartnerItems.map((item) => ({
        src: item.src,
        alt: `${item.alt}-${index + 1}`,
      }))
    );
  }, [trustedPartnerItems]);

  return (
    <AppLayout layoutMode="topnav">
      <div className="flex min-w-0 overflow-x-hidden">
        <div className="flex-1 min-w-0 w-full overflow-x-hidden">
          {isFilterRowOpen && (
            <>
            <div className="fixed top-[74px] left-0 right-0 z-30 bg-white border-b border-[#E8E6E1] shadow-sm">
              <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
                {/* Row 1 — dropdown filter chips */}
                <div className="flex items-center gap-1 border-b border-[#E8E6E1] py-2 overflow-x-auto scrollbar-none">
                  {/* Lokasi chip */}
                  <div className="relative inline-flex shrink-0">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-1">
                      <span className="font-jakarta text-sm font-medium text-ink whitespace-nowrap">Lokasi</span>
                    </div>
                    <select
                      value={filters.countries[0] ?? ""}
                      onChange={(e) => updateFilters({ countries: e.target.value ? [e.target.value] : [] })}
                      className="h-10 appearance-none rounded-lg border border-[#BFC7D4] bg-white pl-14 pr-8 font-jakarta text-sm text-ink-muted focus:outline-none focus:border-primary cursor-pointer min-w-[120px]"
                    >
                      <option value="">Semua</option>
                      {countryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <ArrowDown01Icon size={14} className="text-ink-muted" />
                    </div>
                  </div>

                  {/* Sektor chip */}
                  <div className="relative inline-flex shrink-0">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <span className="font-jakarta text-sm font-medium text-ink whitespace-nowrap">Sektor</span>
                    </div>
                    <select
                      value={filters.sectors[0] ?? ""}
                      onChange={(e) => updateFilters({ sectors: e.target.value ? [e.target.value] : [] })}
                      className="h-10 appearance-none rounded-lg border border-[#BFC7D4] bg-white pl-14 pr-8 font-jakarta text-sm text-ink-muted focus:outline-none focus:border-primary cursor-pointer min-w-[120px]"
                    >
                      <option value="">Semua</option>
                      {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <ArrowDown01Icon size={14} className="text-ink-muted" />
                    </div>
                  </div>
                </div>

                {/* Row 2 — sort + toggles + clear all */}
                <div className="flex items-center gap-5 py-2 overflow-x-auto scrollbar-none">
                  {/* Sort */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-jakarta text-sm text-ink whitespace-nowrap">Urut dengan</span>
                    <div className="relative inline-flex">
                      <select
                        value={filters.sortBy}
                        onChange={(e) => updateFilters({ sortBy: e.target.value as FilterState["sortBy"] })}
                        className="h-8 appearance-none rounded-lg border border-[#BFC7D4] bg-white pl-3 pr-7 font-jakarta text-sm text-ink focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="latest">Terbaru</option>
                        <option value="skill_match">Skill match</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
                        <ArrowDown01Icon size={12} className="text-ink-muted" />
                      </div>
                    </div>
                  </div>

                  {/* Skill Match toggle */}
                  <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={filters.skillMatchOnly}
                      onClick={() => updateFilters({ skillMatchOnly: !filters.skillMatchOnly })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        filters.skillMatchOnly ? "bg-primary" : "bg-[#D1D5DB]"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                          filters.skillMatchOnly ? "translate-x-[18px]" : "translate-x-[3px]"
                        }`}
                      />
                    </button>
                    <span className="font-jakarta text-sm text-ink whitespace-nowrap">Skill Match</span>
                  </label>

                  {/* Funder Only toggle */}
                  <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={filters.fundedOnly}
                      onClick={() => updateFilters({ fundedOnly: !filters.fundedOnly })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        filters.fundedOnly ? "bg-primary" : "bg-[#D1D5DB]"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                          filters.fundedOnly ? "translate-x-[18px]" : "translate-x-[3px]"
                        }`}
                      />
                    </button>
                    <span className="font-jakarta text-sm text-ink whitespace-nowrap">Funder Only</span>
                  </label>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Clear All */}
                  <button
                    type="button"
                    onClick={() => updateFilters({ countries: [], sectors: [], fundedOnly: false, skillMatchOnly: false, sortBy: "latest" })}
                    className="shrink-0 h-8 px-4 rounded-lg bg-primary text-white font-jakarta text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
            {/* Dark backdrop */}
            <div
              className="fixed top-[74px] inset-x-0 bottom-0 z-20 bg-black/40"
              onClick={() => setIsFilterRowOpen(false)}
              aria-hidden="true"
            />
            </>
          )}

          {/* Funder mode banner */}
          {hydrated && canUseFunderMode && funderMode && (
            <div className="mb-4 flex items-center gap-2 bg-funded/8 border border-funded/20 rounded-card px-4 py-2.5">
              <span className="w-2 h-2 rounded-full bg-funded animate-pulse shrink-0" />
              <p className="font-jakarta text-xs text-funded-dark font-medium">
                Funder Mode — kartu lowongan menampilkan jumlah kandidat qualified dan estimasi dana yang dibutuhkan.
              </p>
            </div>
          )}

          {/* CTA Banner */}
          <Link href="/detail" className="block mb-2 group">
            <div className="relative overflow-hidden rounded-2xl bg-[#0e0e0e] h-[140px] flex items-center">
              {/* Dot-grid texture */}
              <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />
              {/* Globe — right 2/5 of container */}
              <div className="absolute right-0 top-0 w-2/5 aspect-square pointer-events-none">
                <Globe
                  config={{
                    width: 800,
                    height: 800,
                    onRender: () => {},
                    devicePixelRatio: 2,
                    phi: 0,
                    theta: 0.3,
                    dark: 1,
                    diffuse: 0.8,
                    mapSamples: 16000,
                    mapBrightness: 8,
                    baseColor: [0.3, 0.3, 0.3],
                    markerColor: [200 / 255, 16 / 255, 46 / 255],
                    glowColor: [0.4, 0.08, 0.12],
                    markers: [
                      { location: [-6.2088, 106.8456], size: 0.08 },
                      { location: [35.6762, 139.6503], size: 0.05 },
                      { location: [37.5665, 126.978], size: 0.05 },
                      { location: [1.3521, 103.8198], size: 0.04 },
                      { location: [25.2048, 55.2708], size: 0.04 },
                    ],
                  }}
                  className="w-full h-full max-w-none"
                />
              </div>
              {/* Gradient fade from left text to globe on right */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e] from-30% via-[#0e0e0e]/60 via-50% to-transparent" />
              {/* Text content */}
              <div className="relative z-10 px-7 max-w-[58%]">
                <p className="font-jakarta text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Tentang Kami</p>
                <h3 className="font-jakarta text-lg font-bold text-white leading-snug mb-3">
                  Kerja di luar negeri lebih mudah<br className="hidden sm:block" /> dari yang kamu kira.
                </h3>
                <span className="inline-flex items-center gap-2 h-8 px-4 rounded-lg bg-primary text-white font-jakarta text-xs font-semibold group-hover:bg-primary/90 transition-colors">
                  Klik disini
                </span>
              </div>
            </div>
          </Link>

          <div className="mb-5">
            <p className="font-jakarta text-xs font-semibold text-ink-muted mb-2">Trusted by</p>
            <InfiniteMovingLogos
              items={marqueeItems}
              speed="slow"
              pauseOnHover
              edgeFade
              className="mb-3"
            />
          </div>

          {/* Quick category chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
            <button
              type="button"
              className={`shrink-0 h-10 rounded-xl border px-4 font-jakarta text-sm transition-colors ${
                filters.countries.length === 0
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink-muted border-ink/10 hover:text-ink"
              }`}
              onClick={() => updateFilters({ countries: [] })}
            >
              All Jobs
            </button>
            {JOBS_QUICK_COUNTRY_FILTERS.map((country) => (
              <button
                key={country}
                type="button"
                className={`shrink-0 h-10 rounded-xl border px-4 font-jakarta text-sm transition-colors ${
                  hasActiveQuickCountry && filters.countries[0] === country
                    ? "bg-ink text-white border-ink"
                    : "bg-white text-ink-muted border-ink/10 hover:text-ink"
                }`}
                onClick={() => updateFilters({ countries: [country] })}
              >
                {country}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="font-jakarta text-xs text-ink-muted mb-5">
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
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch min-w-0"
                    : "flex flex-col gap-4 min-w-0"
                }
              >
                {visibleJobs.map((job) => {
                  const qualifiedCount = hydrated ? getCount(job.id) : 0;
                  const funderData =
                    canUseFunderMode && funderMode && hydrated
                      ? { qualifiedCount, fundingNeeded: qualifiedCount * job.salaryMin }
                      : undefined;
                  return (
                    <div key={job.id} className={filters.viewMode === "grid" ? "h-full min-h-0" : undefined}>
                      <JobCard job={job} viewMode={filters.viewMode} funderData={funderData} minimal />
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
      </div>
    </AppLayout>
  );
}
