import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { AppLayout } from "@/components/layout/AppLayout";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { BookmarkButton } from "@/components/jobs/BookmarkButton";
import { JobCardMini } from "@/components/jobs/JobCardMini";
import { JobCountryFlagBadge } from "@/components/jobs/job-country-flag-badge";
import { SubcoursesPanel } from "@/components/jobs/SubcoursesPanel";
import {
  getJob,
  getSimilarJobs,
  listJobs,
  JobsServiceError,
} from "@/services/jobs";
import { mapPortalJobToUi } from "@/lib/map-portal-job";
import type { Job } from "@/types";
import type { Job as PortalJob } from "@/services/jobs";
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

const LANGUAGE_TO_ISO: Record<string, string> = {
  english: "gb",
  japanese: "jp",
  "bahasa jepang": "jp",
  nihongo: "jp",
  korean: "kr",
  "bahasa korea": "kr",
  german: "de",
  deutsch: "de",
  "bahasa jerman": "de",
  french: "fr",
  arabic: "sa",
  mandarin: "cn",
  chinese: "cn",
  italian: "it",
  spanish: "es",
  portuguese: "pt",
  dutch: "nl",
  thai: "th",
};

function getLanguageIso(skillName: string): string | null {
  const lower = skillName.toLowerCase();
  for (const [keyword, iso] of Object.entries(LANGUAGE_TO_ISO)) {
    if (lower.includes(keyword)) return iso;
  }
  return null;
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

function isJobNotFoundError(e: unknown): boolean {
  if (!(e instanceof JobsServiceError)) return false;
  if (e.status === 404) return true;
  return /not\s*found|tidak\s*ditemukan|unknown\s+job|no\s+job/i.test(e.message);
}

async function findJobByPathnameId(pathId: string): Promise<Job | null> {
  const id = pathId.trim();
  if (!id) return null;
  const first = await listJobs({ page: 1, pageSize: 150 });
  const rows = first.jobs as PortalJob[];
  const matched = rows.find((row) => {
    const raw = (row._id ?? row["job-id"] ?? "") as unknown;
    if (typeof raw === "string" && raw === id) return true;
    if (typeof raw === "object" && raw && "$oid" in (raw as Record<string, unknown>)) {
      const oid = (raw as { $oid?: unknown }).$oid;
      return typeof oid === "string" && oid === id;
    }
    return row["job-id"] === id;
  });
  return matched ? mapPortalJobToUi(matched as unknown) : null;
}

function formatSalary(min: number, max: number, currency: string): string {
  if (min <= 0 && max <= 0) {
    return "";
  }
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
  let job: Job;
  try {
    const detail = await getJob(id);
    job = mapPortalJobToUi(detail as unknown);
  } catch (e) {
    if (!isJobNotFoundError(e)) throw e;
    const fallback = await findJobByPathnameId(id);
    if (!fallback) notFound();
    job = fallback;
  }

  let similarJobs: Job[] = [];
  try {
    const similar = await getSimilarJobs(id);
    similarJobs = similar
      .map((j) => mapPortalJobToUi(j as unknown))
      .slice(0, 2);
  } catch {
    similarJobs = [];
  }

  let otherPrograms: Job[] = [];
  try {
    const res = await listJobs({ page: 1, pageSize: 30 });
    const seen = new Set<string>();
    otherPrograms = res.jobs
      .map((item) => mapPortalJobToUi(item as unknown))
      .filter((item) => item.id !== job.id)
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 10);
  } catch {
    otherPrograms = [];
  }

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
    <AppLayout layoutMode="topnav">
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-1.5 font-jakarta text-xs text-ink-muted mb-6">
        <Link href="/jobs" className="hover:text-primary transition-colors">
          Beranda
        </Link>
        <ArrowRight01Icon size={10} className="text-ink-faint" />
        <Link href="/jobs" className="hover:text-primary transition-colors">
          Lowongan
        </Link>
        <ArrowRight01Icon size={10} className="text-ink-faint" />
        <span className="text-ink font-medium truncate max-w-[200px]">
          {job.title}
        </span>
      </nav>

      {/* ── JOB HEADER CARD ── */}
      <div className="bg-white border border-ink/10 rounded-card p-6 mb-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-jakarta text-sm text-ink-muted flex items-center gap-2.5 mb-2">
                <JobCountryFlagBadge job={job} />
                <span>
                  {job.placement
                    ? `${job.placement.city}, ${job.placement.country}`
                    : job.country}
                </span>
              </p>
              <h1 className="font-jakarta font-bold text-2xl sm:text-3xl text-ink mb-1">
                {job.title}
              </h1>
              <p className="font-jakarta text-base text-ink-muted">{job.company}</p>

              {job.salaryMin > 0 || job.salaryMax > 0 ? (
                <div className="mt-3">
                  <p className="font-jakarta font-bold text-2xl text-primary">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="font-jakarta text-xs bg-app-bg text-ink-muted px-2 py-1 rounded-badge font-medium">
                  via {job.offTaker}
                </span>
                <span className="font-jakarta text-xs bg-app-bg text-ink-muted px-2 py-1 rounded-badge font-medium">
                  {job.sector}
                </span>
                {job.status ? (
                  <span className="font-jakarta text-xs bg-primary/10 text-primary px-2 py-1 rounded-badge font-medium capitalize">
                    {job.status}
                  </span>
                ) : null}
              </div>
            </div>
            <BookmarkButton
              localJobId={job.id}
              backendJobId={job.backendJobId}
              className="self-end sm:self-start"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink/8">
            <div className="flex flex-wrap gap-4 font-jakarta text-sm text-ink-muted min-w-0">
              <span className="flex items-center gap-1.5">
                <Calendar01Icon size={14} className="shrink-0" />
                Diposting {postedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <UserAdd01Icon size={14} className="shrink-0" />
                Deadline {deadlineDate}
              </span>
            </div>
            <div className="flex w-full items-stretch justify-end gap-2 sm:w-auto sm:shrink-0">
              {job.externalJobUrl ? (
                <Link
                  href={job.externalJobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-ink/20 bg-white px-4 font-jakarta text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
                >
                  Lihat Detail
                </Link>
              ) : null}
              <ApplyButton job={job} size="default" className="w-36 max-w-full" />
            </div>
          </div>
        </div>
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
            <p className="font-jakarta text-sm text-ink-muted leading-relaxed whitespace-pre-line">
              {job.description.trim() ? job.description : "Deskripsi akan ditambahkan oleh rekruter."}
            </p>
          </div>

          {/* Qualifications */}
          {job.qualifications.length > 0 ? (
            <div className="bg-white border border-ink/10 rounded-card p-6">
              <h2 className="font-jakarta font-bold text-lg text-ink mb-4">
                Kualifikasi
              </h2>
              <ul className="space-y-2.5">
                {job.qualifications.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span className="font-jakarta text-sm text-ink-muted leading-snug">
                      {q}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {job.skillRequirements.length > 0 ? (
            <div className="bg-white border border-ink/10 rounded-card p-6">
              <h2 className="font-jakarta font-bold text-lg text-ink mb-4">
                Keahlian
              </h2>
              <div className="flex flex-wrap gap-3">
                {job.skillRequirements.map((s, idx) => {
                  const iso = getLanguageIso(s.skillName);
                  const href = s.zenleapUrl ?? `https://zenleap.id/search?q=${encodeURIComponent(s.skillName)}`;
                  return (
                    <a
                      key={`${s.skillName}-${idx}`}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col w-[72px] rounded-xl border border-ink/10 hover:border-primary/40 hover:shadow-md transition-all overflow-hidden cursor-pointer"
                    >
                      {/* Flag — fills top section edge-to-edge, no padding */}
                      <div className="w-full h-10 overflow-hidden bg-app-bg shrink-0">
                        {iso ? (
                          <img
                            src={`https://flagcdn.com/w160/${iso}.png`}
                            alt={s.skillName}
                            width={160}
                            height={107}
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-2xl">
                            🌐
                          </span>
                        )}
                      </div>
                      {/* Text — bottom 2/3 */}
                      <div className="flex flex-col items-center gap-0.5 px-2 py-2">
                        <span className="font-jakarta text-xs font-semibold text-ink text-center leading-tight">
                          {s.skillName}
                        </span>
                        {s.requiredLevel > 0 && (
                          <span className="font-jakarta text-[10px] text-ink-muted">
                            min. {s.requiredLevel}%
                          </span>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Subcourses panel — replaces old skill gap */}
          {job.requiredSubcourses && job.requiredSubcourses.length > 0 && (
            <SubcoursesPanel courses={job.requiredSubcourses} />
          )}
          {/* Benefits */}
          {job.benefits.length > 0 ? (
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
          ) : null}

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

            {otherPrograms.length > 0 && (
              <div className="bg-white border border-ink/10 rounded-card p-4">
                <h3 className="font-jakarta font-semibold text-sm text-ink mb-3">
                  Program Lainnya
                </h3>
                <div className="space-y-2.5">
                  {otherPrograms.map((program) => (
                    <Link
                      key={program.id}
                      href={`/jobs/${program.id}`}
                      className="block rounded-lg border border-ink/10 px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <p className="font-jakarta text-xs font-semibold text-ink line-clamp-2">
                        {program.title}
                      </p>
                      <p className="font-jakarta text-[11px] text-ink-muted mt-0.5">
                        {program.company}
                      </p>
                    </Link>
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
