"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight01Icon } from "hugeicons-react";
import { COUNTRY_TO_ISO } from "@/types";
import type { Job } from "@/types";

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
};

interface JobCardProps {
  job: Job;
  variant?: "default" | "featured";
  viewMode?: "grid" | "list";
  funderData?: { qualifiedCount: number; fundingNeeded: number };
  minimal?: boolean;
}

function formatSalary(min: number, max: number, currency: string): string {
  if (currency === "IDR") {
    const fmt = (n: number) =>
      n >= 1_000_000
        ? `Rp ${(n / 1_000_000).toFixed(0)} jt`
        : `Rp ${n.toLocaleString("id-ID")}`;
    return `${fmt(min)} – ${fmt(max)}`;
  }
  return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}`;
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

export function JobCard({
  job,
  variant = "default",
  viewMode = "grid",
  funderData,
  minimal = false,
}: JobCardProps) {
  const countryCode = job.countryCode ?? COUNTRY_TO_ISO[job.country];
  const FlagIcon = countryCode ? FLAG_MAP[countryCode] : null;

  const isBar = viewMode === "list";

  if (isBar) {
    return (
      <Link href={`/jobs/${job.id}`} className="block group min-w-0">
        <motion.article
          className="bg-white border border-ink/15 rounded-xl px-4 py-3 min-w-0 flex flex-row items-center gap-3 sm:gap-4 border-l-4 border-l-primary shadow-sm"
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
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
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

          {/* Right: posisi button */}
          <span className="inline-flex items-center justify-center font-jakarta text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1 transition-colors shrink-0">
            <ArrowRight01Icon size={12} className="shrink-0" />
          </span>
        </motion.article>
      </Link>
    );
  }

  return (
    <Link href={`/jobs/${job.id}`} className="block group h-full min-w-0">
      <motion.article
        className={`bg-white border border-ink/15 rounded-2xl h-full flex flex-col min-w-0 overflow-hidden shadow-sm ${
          minimal ? "p-4 min-h-[220px]" : "p-5 min-h-[260px] border-l-4 border-l-primary"
        }`}
        whileHover={{
          y: minimal ? -2 : -4,
          boxShadow: minimal
            ? "0 6px 20px rgba(0, 0, 0, 0.08)"
            : "0 8px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(200, 16, 46, 0.08)",
          transition: { duration: 0.2, ease: "easeOut" },
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Top row: flag + country | off-taker logo */}
        <div className={`flex items-center justify-between gap-2 min-w-0 ${minimal ? "mb-2" : "mb-3"}`}>
          <span className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            {FlagIcon ? (
              <span
                className={`relative block rounded-lg border border-ink/20 overflow-hidden shrink-0 ${
                  minimal ? "w-10 h-7" : "w-12 h-8 border-2 shadow-sm"
                }`}
              >
                <span className="absolute inset-0 [&>svg]:absolute [&>svg]:inset-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:scale-125 [&>svg]:block">
                  <FlagIcon title={job.country} className="w-full h-full" />
                </span>
              </span>
            ) : (
              <span className="shrink-0">{job.countryFlag}</span>
            )}
            <span className="text-sm font-medium text-ink truncate min-w-0">{job.country}</span>
          </span>
          {!minimal && <OffTakerBadge offTaker={job.offTaker} />}
        </div>

        {/* Job title */}
        <h3
          className={`font-jakarta font-bold text-ink leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150 ${
            minimal ? "text-lg sm:text-xl font-semibold" : "text-base"
          }`}
        >
          {job.title}
        </h3>

        {/* Company + offTaker */}
        <p className={`text-ink-muted mt-1.5 line-clamp-1 ${minimal ? "text-xs" : "text-sm"}`}>
          {minimal ? job.company : `${job.company} · via ${job.offTaker}`}
        </p>

        {/* Salary + footer pinned to bottom */}
        <div className="mt-auto">
          <p className={`font-jakarta text-primary min-w-0 ${minimal ? "font-semibold text-base pt-4" : "font-bold text-2xl pt-4"}`}>
            <span className="whitespace-nowrap">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
            <span className={`${minimal ? "text-xs" : "text-sm"} font-jakarta font-medium text-ink/70`}> /bln</span>
          </p>

          {/* Funder overlay */}
          {funderData && (
            <div className="mt-3 flex items-center justify-between bg-funded/8 border border-funded/20 rounded-lg px-3 py-2 gap-2">
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

          <div className={`flex items-center justify-between gap-2 min-w-0 ${minimal ? "pt-2 mt-2" : "pt-3 border-t border-ink/10 mt-3"}`}>
            <span className="text-xs text-ink-muted bg-ink/5 px-2.5 py-1.5 rounded-badge font-medium truncate min-w-0">
              {job.sector}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-jakarta font-semibold text-primary rounded-lg transition-colors ${
                minimal
                  ? "text-xs px-2 py-1 bg-transparent"
                  : "text-sm bg-primary/5 hover:bg-primary/10 border border-primary/20 px-3 py-1.5 group-hover:border-primary/40"
              }`}
            >
              <ArrowRight01Icon size={14} className="shrink-0" />
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
