"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { FundingBadge } from "@/components/ui/FundingBadge";
import { JOBS } from "@/lib/mock-data";
import type { JobFairEmployer } from "@/types";

interface EmployerDrawerProps {
  employer: JobFairEmployer | null;
  open: boolean;
  onClose: () => void;
}

export function EmployerDrawer({ employer, open, onClose }: EmployerDrawerProps) {
  if (!employer) return null;

  const employerJobs = JOBS.filter((j) => employer.jobIds.includes(j.id));

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-white">
        <SheetHeader className="mb-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-primary rounded-card flex items-center justify-center text-white font-jakarta font-bold text-sm shrink-0">
              {employer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <SheetTitle className="font-jakarta text-lg text-ink">
                {employer.name}
              </SheetTitle>
              <p className="font-jakarta text-sm text-ink-muted mt-0.5">
                {employer.countryFlag} {employer.country} · {employer.sector}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Description */}
        <p className="font-jakarta text-sm text-ink-muted leading-relaxed mb-6">
          {employer.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-app-bg rounded-card p-3 text-center">
            <div className="font-jakarta text-xl font-bold text-primary">
              {employer.jobCount}
            </div>
            <div className="font-jakarta text-xs text-ink-muted">Posisi tersedia</div>
          </div>
          <div className="bg-app-bg rounded-card p-3 text-center">
            <div className="font-jakarta text-xl font-bold text-ink">
              {employer.countryFlag}
            </div>
            <div className="font-jakarta text-xs text-ink-muted">{employer.country}</div>
          </div>
        </div>

        {/* Job listings */}
        <div>
          <h4 className="font-jakarta font-semibold text-sm mb-3 text-ink">
            Posisi Tersedia ({employerJobs.length})
          </h4>
          <div className="space-y-3">
            {employerJobs.map((job) => (
              <div
                key={job.id}
                className="border border-ink/10 rounded-card p-4 bg-white"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h5 className="font-jakarta font-semibold text-sm text-ink">
                      {job.title}
                    </h5>
                    <p className="font-jakarta text-xs text-ink-muted mt-0.5">
                      {job.positions} posisi · via {job.offTaker}
                    </p>
                  </div>
                  {job.isFunded && <FundingBadge />}
                </div>
                <p className="font-jakarta text-xs font-bold text-primary mb-3">
                  {job.salaryCurrency === "IDR"
                    ? `Rp ${(job.salaryMin / 1_000_000).toFixed(0)}–${(job.salaryMax / 1_000_000).toFixed(0)} jt/bln`
                    : `${job.salaryCurrency} ${job.salaryMin}–${job.salaryMax}/bln`}
                </p>
                <div className="flex gap-2">
                  <ApplyButton job={job} size="sm" className="flex-1" />
                  <a
                    href={`/jobs/${job.id}`}
                    className="flex-1 text-center font-jakarta text-xs font-medium border border-ink/15 rounded-btn py-1.5 hover:border-primary hover:text-primary transition-colors duration-150"
                  >
                    Detail
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
