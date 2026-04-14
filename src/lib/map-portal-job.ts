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

/** Split API bullet / newline text into list items for cards & detail UI */
function splitBulletLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[•\-\*\u2022]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

function parseListFromTextFields(
  r: Record<string, unknown>,
  textKeys: string[],
  arrayKeys: string[],
): string[] {
  const fromArray = parseStringArray(r, arrayKeys);
  if (fromArray.length > 0) return fromArray;
  for (const k of textKeys) {
    const raw = r[k];
    if (typeof raw === "string" && raw.trim()) return splitBulletLines(raw);
  }
  return [];
}

function parseSkillRequirements(r: Record<string, unknown>): SkillRequirement[] {
  const buckets = [
    r["skill-requirements"],
    r.skillRequirements,
    r.skill_requirements,
    r.skills,
  ];
  const out: SkillRequirement[] = [];
  for (const v of buckets) {
    if (!Array.isArray(v)) continue;
    for (const item of v) {
      const o = asRecord(item);
      const skillName = pickString(o, [
        "skill-name",
        "skillName",
        "name",
        "title",
        "label",
        "skill",
      ]);
      if (!skillName) continue;
      out.push({
        skillName,
        requiredLevel: pickNumber(o, ["required-level", "requiredLevel", "level"], 0),
        userLevel: pickNumber(o, ["user-level", "userLevel"], 0),
      });
    }
    if (out.length > 0) break;
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
  if (typeof p === "string" && p.trim()) {
    const country = pickString(r, ["country"], "");
    const label = p.trim();
    return {
      city: label,
      state: "",
      country: country || label,
    };
  }
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

function resolveOffTaker(r: Record<string, unknown>): Job["offTaker"] {
  const explicit = pickString(r, ["off-taker", "offTaker"]).trim();
  const allowed: Job["offTaker"][] = [
    "APJATI",
    "Vokati",
    "BINAWAN",
    "Mitra Kerja Nusantara",
  ];
  if (allowed.includes(explicit as Job["offTaker"])) return explicit as Job["offTaker"];
  const vokUrl = pickString(r, ["vokati_job_url", "vokatiJobUrl"]);
  if (/vokati/i.test(vokUrl)) return "Vokati";
  const company = pickString(r, ["company_name", "company"]).toLowerCase();
  if (company.includes("binawan")) return "BINAWAN";
  return "APJATI";
}

function inferMpChannel(
  raw: string,
): "zenius" | "telkomsel" | undefined {
  const s = raw.toLowerCase();
  if (s.includes("zenius")) return "zenius";
  if (s.includes("telkomsel")) return "telkomsel";
  return undefined;
}

function pickJobId(r: Record<string, unknown>): string {
  const fromKeys = pickString(r, ["job-id", "jobId", "id"], "");
  if (fromKeys) return fromKeys;
  const oid = r._id;
  if (typeof oid === "string" && oid.trim()) return oid.trim();
  if (typeof oid === "object" && oid !== null && "$oid" in oid) {
    const hex = (oid as { $oid?: unknown }).$oid;
    if (typeof hex === "string" && hex.trim()) return hex.trim();
  }
  return "unknown";
}

/**
 * Maps a portal `GET /jobs` or `GET /jobs/:id` document (kebab-case / mixed) into UI `Job`.
 */
export function mapPortalJobToUi(raw: unknown): Job {
  const r = asRecord(raw);
  const id = pickJobId(r);
  const country = pickString(r, ["country"], "Unknown");
  const iso = COUNTRY_TO_ISO[country];
  const postedAt = pickString(
    r,
    ["posted-at", "postedAt", "created_at", "createdAt"],
    new Date().toISOString(),
  );
  const deadline = pickString(
    r,
    ["deadline", "apply-deadline", "applyDeadline", "closes-at"],
    postedAt,
  );
  const mpRaw = pickString(r, ["mp-channel", "mpChannel", "marketing-partner"]);
  const qualifications = parseListFromTextFields(
    r,
    ["requirements_text", "requirementsText"],
    ["qualifications", "qualification"],
  );
  const benefits = parseListFromTextFields(
    r,
    ["benefits_text", "benefitsText"],
    ["benefits", "benefit"],
  );
  const documentRequirements = parseListFromTextFields(
    r,
    ["document_requirements_text", "documentRequirementsText"],
    ["document-requirements", "documentRequirements"],
  );

  return {
    id,
    title: pickString(r, ["title"], "Lowongan"),
    company: pickString(
      r,
      ["company", "company_name", "employer-name", "employerName"],
      "—",
    ),
    offTaker: resolveOffTaker(r),
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
      [
        "description",
        "description_intro",
        "descriptionIntro",
        "summary",
        "job-description",
      ],
      "",
    ),
    qualifications,
    benefits,
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
    documentRequirements,
    requiredSubcourses: parseStringArray(r, [
      "required-subcourses",
      "requiredSubcourses",
      "subcourses",
    ]),
    externalJobUrl:
      pickString(r, ["vokati_job_url", "vokatiJobUrl", "external_job_url"]) ||
      undefined,
    status: pickString(r, ["status"], "") || undefined,
  };
}
