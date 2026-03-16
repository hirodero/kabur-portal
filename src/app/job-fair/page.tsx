"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CountdownTimer } from "@/components/job-fair/CountdownTimer";
import { EmployerBoothCard } from "@/components/job-fair/EmployerBoothCard";
import { EmployerDrawer } from "@/components/job-fair/EmployerDrawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JOB_FAIR_EVENT, PAST_JOB_FAIRS, JOBS } from "@/lib/mock-data";
import { getJobFairBookmarks, toggleJobFairBookmark } from "@/lib/storage";
import type { JobFairEmployer } from "@/types";
import {
  Bookmark02Icon,
  BookmarkAdd02Icon,
  CalendarAdd01Icon,
  UserMultiple02Icon,
  Location08Icon,
  CheckmarkCircle02Icon,
} from "hugeicons-react";
import { Button } from "@heroui/react";

const SECTOR_TABS = [
  "Semua",
  "Care Worker",
  "Hospitality",
  "Konstruksi",
  "Manufaktur",
  "IT",
] as const;

type SectorTab = (typeof SECTOR_TABS)[number];

const SECTOR_MAP: Record<string, string> = {
  "Care Worker": "Care Worker",
  Hospitality: "Hospitality",
  Konstruksi: "Construction",
  Manufaktur: "Manufacturing",
  IT: "IT",
};

export default function JobFairPage() {
  const [activeTab, setActiveTab] = useState<SectorTab>("Semua");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<JobFairEmployer | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    setBookmarks(getJobFairBookmarks());
  }, []);

  const countdownTarget = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  }, []);

  const filteredEmployers = useMemo(() => {
    if (activeTab === "Semua") return JOB_FAIR_EVENT.employers;
    const mapped = SECTOR_MAP[activeTab];
    return JOB_FAIR_EVENT.employers.filter((e) => e.sector === mapped);
  }, [activeTab]);

  function openBooth(employer: JobFairEmployer) {
    setSelectedEmployer(employer);
    setDrawerOpen(true);
  }

  function handleToggleBookmark(jobId: string) {
    toggleJobFairBookmark(jobId);
    setBookmarks(getJobFairBookmarks());
  }

  const bookmarkedJobs = JOBS.filter((j) => bookmarks.includes(j.id));

  return (
    <AppLayout>
      {/* ── EVENT HERO BAND ── */}
      <div
        className="grain relative overflow-hidden rounded-card mb-8 px-6 sm:px-10 py-10"
        style={{ background: 'linear-gradient(135deg, #1A1A18 0%, #2A1A1A 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#C8102E' }} />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-jakarta text-primary text-xs font-semibold uppercase tracking-wider">
                Event Mendatang
              </span>
            </div>
            <h1 className="font-jakarta font-bold text-2xl sm:text-3xl text-white leading-tight mb-4">
              {JOB_FAIR_EVENT.name}
            </h1>
            <div className="flex flex-wrap gap-3 font-jakarta text-sm text-white/60 mb-6">
              <span className="flex items-center gap-1.5">
                <CalendarAdd01Icon size={14} className="text-primary" />
                15–17 April 2025 · Online
              </span>
              <span className="flex items-center gap-1.5">
                <UserMultiple02Icon size={14} className="text-primary" />
                #KaburPortal × KP2MI
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="font-jakarta font-medium text-sm bg-primary text-white px-6 py-2.5 rounded-btn hover:bg-primary-dark transition-colors active:scale-[0.97]">
                Daftar Sekarang
              </button>
              <button className="font-jakarta font-medium text-sm border border-white/20 text-white/80 px-6 py-2.5 rounded-btn hover:border-white/50 hover:text-white transition-colors active:scale-[0.97]">
                Pelajari lebih lanjut
              </button>
            </div>
          </div>

          {/* Right: Countdown */}
          <div className="flex flex-col items-start lg:items-end gap-3">
            <p className="font-jakarta text-white/40 text-xs uppercase tracking-wider">
              Acara dimulai dalam
            </p>
            <CountdownTimer targetDate={countdownTarget} />
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="bg-white border border-ink/10 rounded-card px-6 py-5 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: UserMultiple02Icon, value: "38", label: "Employer hadir" },
            { icon: CheckmarkCircle02Icon, value: "240+", label: "Posisi tersedia" },
            { icon: Location08Icon, value: "12", label: "Negara tujuan" },
            { icon: CheckmarkCircle02Icon, value: "Gratis", label: "Untuk semua PMI" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-light rounded-card flex items-center justify-center shrink-0">
                <stat.icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-jakarta font-bold text-lg text-ink leading-none">
                  {stat.value}
                </p>
                <p className="font-jakarta text-xs text-ink-muted mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTOR TABS ── */}
      <div className="overflow-x-auto mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max">
          {SECTOR_TABS.map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={activeTab === tab ? "solid" : "bordered"}
              color={activeTab === tab ? "primary" : "default"}
              onClick={() => setActiveTab(tab)}
              className="font-jakarta text-xs whitespace-nowrap"
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* ── EMPLOYER BOOTH GRID ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-jakarta font-bold text-xl text-ink">
            Employer Booth
            <span className="ml-2 font-jakarta text-sm font-normal text-ink-muted">
              ({filteredEmployers.length} employer)
            </span>
          </h2>
        </div>

        {filteredEmployers.length === 0 ? (
          <div className="text-center py-12 text-ink-muted">
            <p className="font-jakarta text-sm">Belum ada employer di sektor ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployers.map((employer) => (
              <EmployerBoothCard
                key={employer.id}
                employer={employer}
                onVisit={openBooth}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── MY SCHEDULE ── */}
      <section className="mb-10">
        <h2 className="font-jakarta font-bold text-xl text-ink mb-5">Jadwal Saya</h2>
        {bookmarkedJobs.length === 0 ? (
          <div className="bg-white border border-ink/10 rounded-card p-8 text-center">
            <Bookmark02Icon size={28} className="mx-auto mb-3 text-ink-faint" />
            <p className="font-jakarta text-sm font-medium text-ink">
              Belum ada lowongan yang disimpan
            </p>
            <p className="font-jakarta text-xs text-ink-muted mt-1">
              Kunjungi booth employer dan simpan posisi yang kamu minati.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-ink/10 rounded-card p-4 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-jakarta text-sm font-semibold text-ink line-clamp-2">
                    {job.title}
                  </h4>
                  <p className="font-jakarta text-xs text-ink-muted mt-0.5">
                    {job.countryFlag} {job.company}
                  </p>
                  <p className="font-jakarta text-xs font-bold text-primary mt-1">
                    {job.salaryCurrency === "IDR"
                      ? `Rp ${(job.salaryMin / 1_000_000).toFixed(0)}–${(job.salaryMax / 1_000_000).toFixed(0)} jt/bln`
                      : `${job.salaryCurrency} ${job.salaryMin}–${job.salaryMax}/bln`}
                  </p>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="primary"
                  onClick={() => handleToggleBookmark(job.id)}
                  aria-label="Hapus dari jadwal"
                  className="shrink-0 min-w-8 w-8 h-8"
                >
                  <BookmarkAdd02Icon size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── PAST JOB FAIRS ── */}
      <section>
        <h2 className="font-jakarta font-bold text-xl text-ink mb-5">
          Job Fair Sebelumnya
        </h2>
        <Accordion
          type="single"
          collapsible
          className="bg-white border border-ink/10 rounded-card overflow-hidden"
        >
          {PAST_JOB_FAIRS.map((fair, idx) => (
            <AccordionItem
              key={fair.id}
              value={fair.id}
              className={idx < PAST_JOB_FAIRS.length - 1 ? "border-b border-ink/8" : ""}
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-app-bg transition-colors">
                <div className="flex items-center justify-between w-full pr-3">
                  <span className="font-jakarta font-semibold text-sm text-ink text-left">
                    {fair.name}
                  </span>
                  <div className="flex gap-4 font-jakarta text-xs text-ink-muted">
                    <span>{fair.employerCount} employer</span>
                    <span>{fair.positionCount} posisi</span>
                    <span className="text-funded font-medium">
                      {fair.placedCount} ditempatkan
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 py-4 bg-app-bg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-jakarta font-bold text-xl text-ink">
                      {fair.employerCount}
                    </p>
                    <p className="font-jakarta text-xs text-ink-muted">Employer hadir</p>
                  </div>
                  <div>
                    <p className="font-jakarta font-bold text-xl text-ink">
                      {fair.positionCount}
                    </p>
                    <p className="font-jakarta text-xs text-ink-muted">Posisi tersedia</p>
                  </div>
                  <div>
                    <p className="font-jakarta font-bold text-xl text-funded">
                      {fair.placedCount}
                    </p>
                    <p className="font-jakarta text-xs text-ink-muted">PMI ditempatkan</p>
                  </div>
                </div>
                <p className="font-jakarta text-xs text-ink-muted mt-4 text-center">
                  {new Date(fair.startDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  –{" "}
                  {new Date(fair.endDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-3 text-right">
          <Button
            variant="light"
            color="primary"
            size="sm"
            className="font-jakarta text-xs min-w-0 h-auto p-0 underline"
          >
            Lihat arsip lengkap →
          </Button>
        </div>
      </section>

      {/* Employer Drawer */}
      <EmployerDrawer
        employer={selectedEmployer}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEmployer(null);
        }}
      />
    </AppLayout>
  );
}
