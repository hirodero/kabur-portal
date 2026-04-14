import Link from "next/link";
import type { Job } from "@/types";

interface JobCardMiniProps {
  job: Job;
}

function formatSalaryShort(min: number, max: number, currency: string): string {
  if (min <= 0 && max <= 0) return "Lihat deskripsi";
  if (currency === "IDR") {
    const fmt = (n: number) =>
      n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}jt` : `${n}`;
    return `Rp ${fmt(min)}–${fmt(max)}/bln`;
  }
  return `${currency} ${min}–${max}/bln`;
}

export function JobCardMini({ job }: JobCardMiniProps) {
  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="bg-white border border-ink/10 rounded-card p-3 hover:shadow-card hover:-translate-y-0.5 transition-all duration-150">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-jakarta text-xs font-semibold text-ink leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
            {job.title}
          </h4>
          <span className="shrink-0 text-[10px] font-bold text-primary whitespace-nowrap">
            {job.countryFlag}
          </span>
        </div>
        <p className="font-jakarta text-[11px] text-ink-muted mb-1.5">{job.company}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-jakarta text-[11px] font-bold text-primary">
            {formatSalaryShort(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
