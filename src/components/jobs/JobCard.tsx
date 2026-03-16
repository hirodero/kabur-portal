"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight01Icon } from "hugeicons-react";
import { COUNTRY_TO_ISO } from "@/types";
import type { Job } from "@/types";

// Flag icons - professional SVG flags
import JP from "country-flag-icons/react/3x2/JP";
import KR from "country-flag-icons/react/3x2/KR";
import HK from "country-flag-icons/react/3x2/HK";
import AE from "country-flag-icons/react/3x2/AE";
import SG from "country-flag-icons/react/3x2/SG";

const FLAG_MAP: Record<string, React.ComponentType<{ title?: string; className?: string }>> = {
  JP,
  KR,
  HK,
  AE,
  SG,
};

const MP_LOGOS: Record<string, string> = {
  zenius: "/zenius.png",
  telkomsel: "/telkomsel.png",
};

interface JobCardProps {
  job: Job;
  variant?: "default" | "featured";
  viewMode?: "grid" | "list";
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

export function JobCard({ job, variant = "default", viewMode = "grid" }: JobCardProps) {
  const mpLogo = job.mpChannel ? MP_LOGOS[job.mpChannel] : undefined;
  const countryCode = job.countryCode ?? COUNTRY_TO_ISO[job.country];
  const FlagIcon = countryCode ? FLAG_MAP[countryCode] : null;

  const isBar = viewMode === "list";

  if (isBar) {
    return (
      <Link href={`/jobs/${job.id}`} className="block group">
        <motion.article
          className="bg-white border border-ink/15 rounded-xl px-5 py-3 min-h-[81px] flex flex-row items-center gap-4 border-l-4 border-l-primary shadow-sm"
          whileHover={{
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(200, 16, 46, 0.06)",
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Flag + country */}
          <span className="flex items-center gap-2 shrink-0">
            {FlagIcon ? (
              <span className="flex items-center justify-center w-10 h-6 rounded-md border border-ink/20 bg-white overflow-hidden shrink-0">
                <FlagIcon title={job.country} className="w-full h-full" />
              </span>
            ) : (
              <span className="text-sm">{job.countryFlag}</span>
            )}
            <span className="text-sm font-medium text-ink hidden sm:inline">{job.country}</span>
          </span>

          {/* MP logo */}
          <div className="flex items-center gap-1.5 shrink-0">
            {job.mpChannel && mpLogo && (
              <span className="flex items-center justify-center w-9 h-6 rounded border border-ink/20 bg-white overflow-hidden p-0.5 shrink-0">
                <Image src={mpLogo} alt={job.mpChannel} width={32} height={18} className="object-contain w-full h-full" />
              </span>
            )}
          </div>

          {/* Title + company */}
          <div className="flex-1 min-w-0">
            <h3 className="font-jakarta font-bold text-sm text-ink leading-snug truncate group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <p className="text-xs text-ink-muted truncate">{job.company} · via {job.offTaker}</p>
          </div>

          {/* Salary */}
          <p className="font-jakarta font-bold text-lg text-primary shrink-0 hidden md:block">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            <span className="text-xs font-medium text-ink/70 ml-0.5">/bln</span>
          </p>

          {/* Sector */}
          <span className="text-[11px] text-ink-muted bg-ink/5 px-2 py-1 rounded-badge font-medium shrink-0 hidden lg:inline">
            {job.sector}
          </span>

          {/* Posisi button */}
          <span className="inline-flex items-center gap-1 font-jakarta text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1 transition-colors shrink-0">
            {job.positions} posisi
            <ArrowRight01Icon size={12} className="shrink-0" />
          </span>
        </motion.article>
      </Link>
    );
  }

  return (
    <Link href={`/jobs/${job.id}`} className="block group h-full">
      <motion.article
        className="bg-white border border-ink/15 rounded-2xl p-5 min-h-[274px] h-full flex flex-col border-l-4 border-l-primary shadow-sm"
        whileHover={{
          y: -4,
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(200, 16, 46, 0.08)",
          transition: { duration: 0.2, ease: "easeOut" },
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Top row: flag + country + MP logo */}
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-3 text-sm">
            {FlagIcon ? (
              <span className="flex items-center justify-center w-12 h-8 rounded-lg border-2 border-ink/20 bg-white overflow-hidden shrink-0 shadow-sm">
                <FlagIcon title={job.country} className="w-full h-full" />
              </span>
            ) : (
              <span>{job.countryFlag}</span>
            )}
            <span className="text-sm font-medium text-ink">{job.country}</span>
          </span>
          {job.mpChannel && mpLogo && (
            <span className="flex items-center justify-center w-12 h-8 rounded-lg border-2 border-ink/20 bg-white overflow-hidden shrink-0 p-1 shadow-sm">
              <Image
                src={mpLogo}
                alt={job.mpChannel}
                width={40}
                height={24}
                className="object-contain w-full h-full"
              />
            </span>
          )}
        </div>

        {/* Job title */}
        <h3 className="font-jakarta font-bold text-base text-ink leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {job.title}
        </h3>

        {/* Company + offTaker */}
        <p className="text-sm text-ink-muted mt-1.5">
          {job.company} · via {job.offTaker}
        </p>

        {/* Salary */}
        <p className="font-jakarta font-bold text-2xl text-primary mt-5">
          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}{" "}
          <span className="text-sm font-jakarta font-medium text-ink/70">/bln</span>
        </p>

        {/* Bottom row - mt-auto ensures footer aligns across cards */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-ink/10">
          <span className="text-xs text-ink-muted bg-ink/5 px-2.5 py-1.5 rounded-badge font-medium">
            {job.sector}
          </span>
          <span className="inline-flex items-center gap-1 font-jakarta text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 transition-colors group-hover:border-primary/40">
            {job.positions} posisi
            <ArrowRight01Icon size={14} className="shrink-0" />
          </span>
        </div>
      </motion.article>
    </Link>
  );
}
