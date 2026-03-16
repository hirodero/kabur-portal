import { notFound } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { SkillGapPanel } from "@/components/jobs/SkillGapPanel";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { FundingBadge } from "@/components/ui/FundingBadge";
import { JobCardMini } from "@/components/jobs/JobCardMini";
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

const MP_CONFIG: Record<string, { label: string; color: string }> = {
  zenius: { label: "Zenius", color: "#C8102E" },
  telkomsel: { label: "Telkomsel", color: "#C8102E" },
};

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

  const mpConfig = job.mpChannel ? MP_CONFIG[job.mpChannel] : null;
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
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left info */}
          <div className="flex-1">
            <h1 className="font-jakarta font-bold text-2xl sm:text-3xl text-ink mb-1">
              {job.title}
            </h1>
            <p className="font-jakarta text-base text-ink-muted mb-4">{job.company}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="font-jakarta text-xs bg-app-bg text-ink-muted px-2 py-1 rounded-badge font-medium">
                via {job.offTaker}
              </span>
              <span className="font-jakarta text-xs bg-app-bg text-ink-muted px-2 py-1 rounded-badge font-medium">
                {job.sector}
              </span>
              <span className="font-jakarta text-xs bg-app-bg text-ink-muted px-2 py-1 rounded-badge font-medium">
                {job.positions} posisi
              </span>
              {job.isFunded && <FundingBadge />}
            </div>

            <div className="flex flex-wrap gap-4 font-jakarta text-sm text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Calendar01Icon size={14} />
                Diposting {postedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <UserAdd01Icon size={14} />
                Deadline {deadlineDate}
              </span>
            </div>
          </div>

          {/* Right: salary + actions */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            <div className="lg:text-right">
              <p className="font-jakarta text-xs text-ink-muted mb-1">Gaji</p>
              <p className="font-jakarta font-bold text-2xl text-primary">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              </p>
              <p className="font-jakarta text-sm text-ink-muted mt-0.5">
                {job.countryFlag} {job.country}
              </p>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <ApplyButton job={job} size="default" className="flex-1 lg:flex-none lg:w-36" />
            </div>
          </div>
        </div>
      </div>

      {/* ── MP CHANNEL BADGE ── */}
      {mpConfig && (
        <div
          className="flex items-center gap-3 rounded-card px-4 py-3 mb-5"
          style={{ backgroundColor: `${mpConfig.color}12` }}
        >
          <div
            className="w-7 h-7 rounded-badge flex items-center justify-center text-white font-jakarta font-bold text-xs shrink-0"
            style={{ backgroundColor: mpConfig.color }}
          >
            {mpConfig.label[0]}
          </div>
          <p className="font-jakarta text-sm font-medium" style={{ color: mpConfig.color }}>
            Dipromosikan oleh {mpConfig.label}
          </p>
        </div>
      )}

      {/* ── FUNDING CALLOUT ── */}
      {job.isFunded && job.funderName && (
        <div className="mb-5">
          <FundingBadge
            variant="callout"
            funderName={job.funderName}
            fundingCoverage={job.fundingCoverage}
          />
        </div>
      )}

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── LEFT: Main content ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Description */}
          <div className="bg-white border border-ink/10 rounded-card p-6">
            <h2 className="font-jakarta font-bold text-lg text-ink mb-4">
              Deskripsi Pekerjaan
            </h2>
            <p className="font-jakarta text-sm text-ink-muted leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Qualifications */}
          <div className="bg-white border border-ink/10 rounded-card p-6">
            <h2 className="font-jakarta font-bold text-lg text-ink mb-4">
              Kualifikasi
            </h2>
            <ul className="space-y-2.5">
              {job.qualifications.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2.5 font-jakarta text-sm text-ink-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  {q}
                </li>
              ))}
            </ul>
          </div>

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
                  {job.countryFlag} {job.country} · {job.sector}
                </p>
              </div>
            </div>
            <p className="font-jakarta text-sm text-ink-muted leading-relaxed">
              {job.company} adalah perusahaan terkemuka di bidang {job.sector.toLowerCase()} yang beroperasi di {job.country}.
              Rekrutmen dilakukan secara resmi melalui {job.offTaker}, memastikan proses yang transparan dan terpercaya untuk seluruh pekerja migran Indonesia.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Sticky sidebar ── */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Skill Gap Panel */}
            <SkillGapPanel skillRequirements={job.skillRequirements} />

            {/* Apply card */}
            <div className="bg-white border border-ink/10 rounded-card p-5">
              <div className="mb-4">
                <p className="font-jakarta text-xs text-ink-muted mb-1">Gaji</p>
                <p className="font-jakarta font-bold text-xl text-primary">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </p>
              </div>
              <div className="flex items-center gap-2 mb-4 font-jakarta text-xs text-ink-muted">
                <Calendar01Icon size={13} />
                <span>Deadline: {deadlineDate}</span>
              </div>
              <ApplyButton job={job} fullWidth />
            </div>

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
