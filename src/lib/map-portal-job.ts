import type { Job, SkillRequirement, TermsAndConditions } from "@/types";
import { COUNTRY_TO_ISO } from "@/types";

function asRecord(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null) return {};
  return raw as Record<string, unknown>;
}

function pickString(
  r: Record<string, unknown>,
  keys: string[],
  fallback = "",
): string {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return fallback;
}

function pickNumber(
  r: Record<string, unknown>,
  keys: string[],
  fallback = 0,
): number {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return fallback;
}

function pickBool(r: Record<string, unknown>, keys: string[]): boolean {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "boolean") return v;
    if (v === "true" || v === true) return true;
  }
  return false;
}

function parseStringArray(r: Record<string, unknown>, keys: string[]): string[] {
  for (const k of keys) {
    const v = r[k];
    if (Array.isArray(v)) {
      return v.filter((x): x is string => typeof x === "string");
    }
    if (typeof v === "string" && v.length > 0) return [v];
  }
  return [];
}

function parseSkillRequirements(r: Record<string, unknown>): SkillRequirement[] {
  const v = r["skill-requirements"] ?? r.skillRequirements ?? r.skill_requirements;
  if (!Array.isArray(v)) return [];
  const out: SkillRequirement[] = [];
  for (const item of v) {
    const o = asRecord(item);
    const skillName = pickString(o, ["skill-name", "skillName", "name"]);
    if (!skillName) continue;
    out.push({
      skillName,
      requiredLevel: pickNumber(o, ["required-level", "requiredLevel"], 0),
      userLevel: pickNumber(o, ["user-level", "userLevel"], 0),
    });
  }
  return out;
}

function parseTerms(r: Record<string, unknown>): TermsAndConditions | undefined {
  const t = r["terms-and-conditions"] ?? r.termsAndConditions;
  const o = asRecord(t);
  if (
    !pickString(o, ["duration-of-contract", "durationOfContract"]) &&
    !pickString(o, ["annual-leave", "annualLeave"])
  ) {
    return undefined;
  }
  return {
    durationOfContract: pickString(o, [
      "duration-of-contract",
      "durationOfContract",
    ]),
    annualLeave: pickString(o, ["annual-leave", "annualLeave"]),
    probationPeriod: pickString(o, ["probation-period", "probationPeriod"]),
    workingDays: pickString(o, ["working-days", "workingDays"]),
    workingHours: pickString(o, ["working-hours", "workingHours"]),
  };
}

function parsePlacement(
  r: Record<string, unknown>,
): Job["placement"] | undefined {
  const p = r.placement ?? r["placement-location"];
  const o = asRecord(p);
  const city = pickString(o, ["city"]);
  const country = pickString(o, ["country"]);
  if (!city && !country) return undefined;
  return {
    city: city || country,
    state: pickString(o, ["state", "region"]),
    country: country || city,
  };
}

function inferMpChannel(
  raw: string,
): "zenius" | "telkomsel" | undefined {
  const s = raw.toLowerCase();
  if (s.includes("zenius")) return "zenius";
  if (s.includes("telkomsel")) return "telkomsel";
  return undefined;
}

/**
 * Maps a portal `GET /jobs` or `GET /jobs/:id` document (kebab-case / mixed) into UI `Job`.
 */
export function mapPortalJobToUi(raw: unknown): Job {
  const r = asRecord(raw);
  const id = pickString(r, ["job-id", "jobId", "id", "_id"], "unknown");
  const country = pickString(r, ["country"], "Unknown");
  const iso = COUNTRY_TO_ISO[country];
  const postedAt = pickString(
    r,
    ["posted-at", "postedAt"],
    new Date().toISOString(),
  );
  const deadline = pickString(
    r,
    ["deadline", "apply-deadline", "applyDeadline", "closes-at"],
    postedAt,
  );
  const offTakerRaw = pickString(r, ["off-taker", "offTaker"], "APJATI");
  const mpRaw = pickString(r, ["mp-channel", "mpChannel", "marketing-partner"]);

  return {
    id,
    title: pickString(r, ["title"], "Lowongan"),
    company: pickString(r, ["company", "employer-name", "employerName"], "—"),
    offTaker: offTakerRaw as Job["offTaker"],
    country,
    countryFlag: pickString(r, ["country-flag", "countryFlag"]) || "🏳️",
    countryCode: pickString(r, ["country-code", "countryCode"]) || iso,
    sector: pickString(r, ["sector"], "Healthcare") as Job["sector"],
    salaryMin: pickNumber(r, ["salary-min", "salaryMin"], 0),
    salaryMax: pickNumber(r, ["salary-max", "salaryMax"], 0),
    salaryCurrency: pickString(r, ["salary-currency", "salaryCurrency"], "IDR"),
    postedAt,
    deadline,
    positions: pickNumber(r, ["positions", "open-positions", "openPositions"], 1),
    description: pickString(
      r,
      ["description", "summary", "job-description"],
      "",
    ),
    qualifications: parseStringArray(r, ["qualifications", "qualification"]),
    benefits: parseStringArray(r, ["benefits", "benefit"]),
    isFunded: pickBool(r, ["is-funded", "isFunded", "funded", "funded-only"]),
    funderName: pickString(r, ["funder-name", "funderName"]) || undefined,
    fundingCoverage: pickString(r, [
      "funding-coverage",
      "fundingCoverage",
    ]) || undefined,
    mpChannel: inferMpChannel(mpRaw),
    skillRequirements: parseSkillRequirements(r),
    employerInfo:
      pickString(r, ["employer-info", "employerInfo", "about-employer"]) ||
      undefined,
    placement: parsePlacement(r),
    termsAndConditions: parseTerms(r),
    documentRequirements: parseStringArray(r, [
      "document-requirements",
      "documentRequirements",
    ]),
    requiredSubcourses: parseStringArray(r, [
      "required-subcourses",
      "requiredSubcourses",
      "subcourses",
    ]),
  };
}
