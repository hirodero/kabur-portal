import { notFound } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { SkillGapPanel } from "@/components/jobs/SkillGapPanel";
import { JobCardMini } from "@/components/jobs/JobCardMini";
import { FunderModeHeader } from "@/components/jobs/FunderModeHeader";
import { QualificationsPanel } from "@/components/jobs/QualificationsPanel";
import { JOBS } from "@/lib/mock-data";
import {
  ArrowRight01Icon,
  AirplaneTakeOff01Icon,
  Home02Icon,
  HealthIcon,
  MoneyBag01Icon,
  Calendar01Icon,
  UserAdd01Icon,
} from "hugeicons-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const BENEFIT_ICONS: Record<string, typeof Home02Icon> = {
  akomodasi: Home02Icon,
  asrama: Home02Icon,
  tiket: AirplaneTakeOff01Icon,
  pesawat: AirplaneTakeOff01Icon,
  asuransi: HealthIcon,
  gaji: MoneyBag01Icon,
  makan: MoneyBag01Icon,
};

function getBenefitIcon(benefit: string) {
  const lower = benefit.toLowerCase();
  for (const [key, Icon] of Object.entries(BENEFIT_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return MoneyBag01Icon;
}

function formatSalary(min: number, max: number, currency: string): string {
  if (currency === "IDR") {
    const fmt = (n: number) =>
      n >= 1_000_000
        ? `Rp ${(n / 1_000_000).toFixed(0)} juta`
        : `Rp ${n.toLocaleString("id-ID")}`;
    return `${fmt(min)} – ${fmt(max)}/bulan`;
  }
  return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}/bulan`;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = JOBS.find((j) => j.id === id);

  if (!job) notFound();

  const similarJobs = JOBS.filter(
    (j) => j.id !== job.id && j.sector === job.sector
  ).slice(0, 2);

  const postedDate = new Date(job.postedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const deadlineDate = new Date(job.deadline).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AppLayout>
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-1.5 font-jakarta text-xs text-ink-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Beranda
        </Link>
        <ArrowRight01Icon size={10} className="text-ink-faint" />
        <Link href="/home" className="hover:text-primary transition-colors">
          Lowongan
        </Link>
        <ArrowRight01Icon size={10} className="text-ink-faint" />
        <span className="text-ink font-medium truncate max-w-[200px]">
          {job.title}
        </span>
      </nav>

      {/* ── JOB HEADER CARD ── */}
      <div className="bg-white border border-ink/10 rounded-card p-6 mb-5">
        <FunderModeHeader
          job={job}
          postedDate={postedDate}
          deadlineDate={deadlineDate}
          formattedSalary={formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
        />
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── LEFT: Main content ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Document requirements */}
          {job.documentRequirements && job.documentRequirements.length > 0 && (
              <div className="bg-white border border-ink/10 rounded-card p-6">
                <h2 className="font-jakarta font-bold text-lg text-ink mb-4 flex items-center gap-2">
                  <UserAdd01Icon size={18} className="text-primary" />
                  Dokumen yang Diperlukan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {job.documentRequirements.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 font-jakarta text-sm text-ink-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            )}
          {/* Description */}
          <div className="bg-white border border-ink/10 rounded-card p-6">
            <h2 className="font-jakarta font-bold text-lg text-ink mb-4">
              Deskripsi Pekerjaan
            </h2>
            <p className="font-jakarta text-sm text-ink-muted leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Qualifications — with funder toggle */}
          <QualificationsPanel jobId={job.id} qualifications={job.qualifications} />

          {/* Skill Gap Panel */}
          <SkillGapPanel skillRequirements={job.skillRequirements} />
          {/* Benefits */}
          <div className="bg-white border border-ink/10 rounded-card p-6">
            <h2 className="font-jakarta font-bold text-lg text-ink mb-4">
              Fasilitas &amp; Benefit
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.benefits.map((benefit, idx) => {
                const Icon = getBenefitIcon(benefit);
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-light rounded-card flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <p className="font-jakarta text-sm text-ink-muted leading-snug pt-1">
                      {benefit}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* About Employer */}
          <div className="bg-white border border-ink/10 rounded-card p-6">
            <h2 className="font-jakarta font-bold text-lg text-ink mb-4">
              Tentang Employer
            </h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-primary rounded-card flex items-center justify-center text-white font-jakarta font-bold text-sm shrink-0">
                {job.company.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-jakarta font-semibold text-ink">{job.company}</p>
                <p className="font-jakarta text-xs text-ink-muted">
                  {job.countryFlag} {job.placement ? `${job.placement.city}, ${job.placement.country}` : job.country} · {job.sector}
                </p>
              </div>
            </div>
            <p className="font-jakarta text-sm text-ink-muted leading-relaxed">
              {job.employerInfo ?? `${job.company} adalah perusahaan terkemuka di bidang ${job.sector.toLowerCase()} yang beroperasi di ${job.country}. Rekrutmen dilakukan secara resmi melalui ${job.offTaker}.`}
            </p>
          </div>

          {/* Terms & Conditions */}
          {job.termsAndConditions && (
            <div className="bg-white border border-ink/10 rounded-card p-6">
              <h2 className="font-jakarta font-bold text-lg text-ink mb-4 flex items-center gap-2">
                <Calendar01Icon size={18} className="text-primary" />
                Syarat & Ketentuan Kontrak
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Durasi Kontrak", value: job.termsAndConditions.durationOfContract },
                  { label: "Cuti Tahunan", value: job.termsAndConditions.annualLeave },
                  { label: "Masa Probasi", value: job.termsAndConditions.probationPeriod },
                  { label: "Hari Kerja", value: job.termsAndConditions.workingDays },
                  { label: "Jam Kerja", value: job.termsAndConditions.workingHours },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-app-bg rounded-lg px-4 py-3">
                    <p className="font-jakarta text-xs text-ink-muted mb-0.5">{label}</p>
                    <p className="font-jakarta text-sm font-medium text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required subcourses */}
          {job.requiredSubcourses && job.requiredSubcourses.length > 0 && (
            <div className="bg-white border border-ink/10 rounded-card p-6">
              <h2 className="font-jakarta font-bold text-lg text-ink mb-4">
                Materi Pelatihan yang Diperlukan
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSubcourses.map((course, idx) => (
                  <span
                    key={idx}
                    className="font-jakarta text-xs bg-primary/5 text-primary border border-primary/15 px-2.5 py-1 rounded-badge"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sticky sidebar ── */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Similar jobs */}
            {similarJobs.length > 0 && (
              <div>
                <h3 className="font-jakarta font-semibold text-sm text-ink mb-3">
                  Lowongan Serupa
                </h3>
                <div className="space-y-3">
                  {similarJobs.map((sj) => (
                    <JobCardMini key={sj.id} job={sj} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
