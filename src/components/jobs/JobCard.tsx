"use client";

import { Link } from "next-view-transitions";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Location01Icon, CreditCardIcon, Briefcase01Icon, Search01Icon } from "hugeicons-react";
import { COUNTRY_TO_ISO } from "@/types";
import type { Job } from "@/types";
import { useState } from "react";
import { BookmarkButton } from "@/components/jobs/BookmarkButton";

const OFFTAKER_LOGOS: Record<string, string> = {
  APJATI: "/apjati-logo.png",
  Vokati: "/vokati-logo.png",
};

// Flag icons - professional SVG flags
import JP from "country-flag-icons/react/3x2/JP";
import KR from "country-flag-icons/react/3x2/KR";
import HK from "country-flag-icons/react/3x2/HK";
import AE from "country-flag-icons/react/3x2/AE";
import SG from "country-flag-icons/react/3x2/SG";
import DE from "country-flag-icons/react/3x2/DE";
import AU from "country-flag-icons/react/3x2/AU";
import AT from "country-flag-icons/react/3x2/AT";
import CH from "country-flag-icons/react/3x2/CH";
import OM from "country-flag-icons/react/3x2/OM";

const FLAG_MAP: Record<string, React.ComponentType<{ title?: string; className?: string }>> = {
  JP,
  KR,
  HK,
  AE,
  SG,
  DE,
  AU,
  AT,
  CH,
  OM,
};

interface JobCardProps {
  job: Job;
  variant?: "default" | "featured";
  viewMode?: "grid" | "list";
  funderData?: { qualifiedCount: number; fundingNeeded: number };
  minimal?: boolean;
}

function hasSalaryRange(min: number, max: number): boolean {
  return min > 0 || max > 0;
}

function formatSalaryFull(min: number, max: number, currency: string): string {
  if (!hasSalaryRange(min, max)) return "Gaji — dijelaskan di deskripsi";
  if (currency === "IDR") {
    const fmt = (n: number) =>
      `Rp ${n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `${fmt(min)} – ${fmt(max)}`;
  }
  return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}`;
}

function formatSalaryShort(min: number, max: number, currency: string): string {
  if (!hasSalaryRange(min, max)) return "Lihat deskripsi";
  if (currency === "IDR") {
    const fmt = (n: number) =>
      n >= 1_000_000
        ? `Rp ${(n / 1_000_000).toFixed(0)} jt`
        : `Rp ${n.toLocaleString("id-ID")}`;
    return `${fmt(min)} – ${fmt(max)}`;
  }
  return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "baru saja";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "a day ago";
  return `${days} days ago`;
}

function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function OffTakerBadge({ offTaker, size = "md" }: { offTaker: string; size?: "sm" | "md" }) {
  const logo = OFFTAKER_LOGOS[offTaker];
  const dim = size === "sm" ? "w-10 h-6" : "w-12 h-8";
  if (logo) {
    return (
      <span className={`relative ${dim} rounded-lg border-2 border-ink/20 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1`}>
        <Image src={logo} alt={offTaker} width={48} height={24} className="object-contain w-full h-full" />
      </span>
    );
  }
  return (
    <span className="font-jakarta text-[10px] font-medium text-ink-muted bg-ink/5 px-2 py-0.5 rounded-badge shrink-0 max-w-[96px] truncate">
      {offTaker}
    </span>
  );
}

// Verified checkmark badge (blue shield style)
function VerifiedBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M8 1L10.12 3.31L13.19 3L13.5 6.07L15.81 8L13.5 9.93L13.19 13L10.12 12.69L8 15L5.88 12.69L2.81 13L2.5 9.93L0.19 8L2.5 6.07L2.81 3L5.88 3.31L8 1Z" fill="#1877F2"/>
      <path d="M5.5 8L7 9.5L10.5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function JobCard({
  job,
  variant = "default",
  viewMode = "grid",
  funderData,
  minimal = false,
}: JobCardProps) {
  const countryCode = job.countryCode ?? COUNTRY_TO_ISO[job.country];
  const FlagIcon = countryCode ? FLAG_MAP[countryCode] : null;
  const [hovered, setHovered] = useState(false);

  const isBar = viewMode === "list";

  if (isBar) {
    return (
      <div className="relative">
        <BookmarkButton
          localJobId={job.id}
          backendJobId={job.backendJobId}
          className="absolute right-3 top-3 z-10"
        />
        <Link href={`/jobs/${job.id}`} className="block group min-w-0">
          <motion.article
            className="bg-white border border-ink/15 rounded-xl px-4 py-3 pr-14 min-w-0 flex flex-row items-center gap-3 sm:gap-4 border-l-4 border-l-primary shadow-sm"
            whileHover={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(200, 16, 46, 0.06)",
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Left: flag + country, salary below */}
            <div className="flex flex-col gap-1 shrink-0">
              <span className="flex items-center gap-2">
                {FlagIcon ? (
                  <span className="relative block w-10 h-6 rounded-md border border-ink/20 overflow-hidden shrink-0">
                    <span className="absolute inset-0 [&>svg]:absolute [&>svg]:inset-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:scale-125 [&>svg]:block">
                      <FlagIcon title={job.country} className="w-full h-full" />
                    </span>
                  </span>
                ) : (
                  <span className="text-sm">{job.countryFlag}</span>
                )}
                <span className="text-sm font-medium text-ink hidden sm:inline">{job.country}</span>
              </span>
              <p className="font-jakarta font-bold text-sm text-primary">
                {formatSalaryShort(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                <span className="text-[10px] font-medium text-ink/70 ml-0.5">/bln</span>
              </p>
            </div>

            {/* Center: title + company, off-taker, sector */}
            <div className="flex-1 min-w-0 flex flex-row flex-wrap items-center gap-2 sm:gap-3">
              <div className="min-w-0 flex-1 basis-0 sm:basis-auto">
                <h3 className="font-jakarta font-bold text-sm text-ink leading-snug truncate group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-ink-muted truncate">{job.company} · via {job.offTaker}</p>
              </div>
              <OffTakerBadge offTaker={job.offTaker} size="sm" />
              <span className="text-[11px] text-ink-muted bg-ink/5 px-2 py-1 rounded-badge font-medium shrink-0 hidden lg:inline">
                {job.sector}
              </span>
            </div>

            {/* Right: arrow */}
            <span className="inline-flex items-center justify-center font-jakarta text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1 transition-colors shrink-0">
              →
            </span>
          </motion.article>
        </Link>
      </div>
    );
  }

  // Grid card — Kalibrr-style
  return (
    <div
      className="block group h-full min-w-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.article
        className="relative bg-white border border-ink/10 rounded-2xl h-full flex flex-col min-w-0 overflow-hidden shadow-sm"
        whileHover={{
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          transition: { duration: 0.2, ease: "easeOut" },
        }}
        transition={{ duration: 0.2 }}
      >
        <BookmarkButton
          localJobId={job.id}
          backendJobId={job.backendJobId}
          className="absolute top-3 right-3 z-20"
        />
        {/* Card body */}
        <div className="flex flex-col flex-1 p-5">
          {/* Flag + company row */}
          <div className="flex items-start gap-3 mb-4">
            {/* Flag as main visual */}
            <div className="relative w-14 h-10 rounded-lg border border-ink/15 overflow-hidden shadow-sm shrink-0">
              {FlagIcon ? (
                <span className="absolute inset-0 [&>svg]:absolute [&>svg]:inset-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:scale-125 [&>svg]:block">
                  <FlagIcon title={job.country} className="w-full h-full" />
                </span>
              ) : (
                <span className="flex items-center justify-center w-full h-full text-2xl">
                  {job.countryFlag}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-jakarta font-bold text-[15px] text-ink leading-snug line-clamp-2">
                {job.title}
              </h3>
              <span className="flex items-center gap-1 mt-0.5">
                <p className="text-[13px] text-ink-muted truncate">{job.company}</p>
                <VerifiedBadge />
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-ink/10 mb-4 -mx-5" />

          {/* Detail rows */}
          <div className="flex flex-col gap-2.5 flex-1">
            <div className="flex items-center gap-2 text-[13px] text-ink-muted">
              <Location01Icon size={15} className="shrink-0 text-ink/30" />
              <span className="truncate">{job.placement?.city ? `${job.placement.city}, ${job.country}` : job.country}</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-ink-muted">
              <CreditCardIcon size={15} className="shrink-0 text-ink/30" />
              <span className="truncate">{formatSalaryFull(job.salaryMin, job.salaryMax, job.salaryCurrency)} / bulan</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-ink-muted">
              <Briefcase01Icon size={15} className="shrink-0 text-ink/30" />
              <span>Penuh waktu</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-ink-muted">
              <Search01Icon size={15} className="shrink-0 text-ink/30" />
              <span>Rekruter terakhir aktif {timeAgo(job.postedAt)}</span>
            </div>

            {/* Funder overlay */}
            {funderData && (
              <div className="mt-1 flex items-center justify-between bg-funded/8 border border-funded/20 rounded-lg px-3 py-2 gap-2">
                <span className="font-jakarta text-[11px] font-semibold text-funded">
                  {funderData.qualifiedCount} qualified
                </span>
                <span className="font-jakarta text-[11px] text-funded-dark font-medium">
                  {funderData.fundingNeeded > 0
                    ? `Rp ${(funderData.fundingNeeded / 1_000_000).toFixed(1)} jt needed`
                    : "Belum ada kandidat"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-ink/8 bg-ink/[0.02]">
          <span className="font-jakarta text-[12px] text-ink-muted">
            Apply before {formatDeadline(job.deadline)}
          </span>
          <span className="font-jakarta text-[11px] text-ink-muted bg-ink/8 px-2.5 py-1 rounded-full truncate max-w-[140px]">
            {job.sector}
          </span>
        </div>

        {/* Hover overlay — glass blur covering only the bottom 2/3 */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 bottom-0 flex flex-col items-center justify-center gap-3 rounded-b-2xl"
              style={{
                top: "33%",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 18%, rgba(255,255,255,0.85) 100%)",
              }}
            >
              <Link
                href={`/jobs/${job.id}`}
                className="w-40 h-11 flex items-center justify-center rounded-xl border border-ink/20 bg-white font-jakarta text-sm font-semibold text-ink hover:bg-ink/5 transition-colors shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                View Post
              </Link>
              <Link
                href={`/jobs/${job.id}?apply=1`}
                className="w-40 h-11 flex items-center justify-center rounded-xl bg-primary font-jakarta text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                Apply
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </div>
  );
}
