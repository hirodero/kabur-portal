export interface SkillRequirement {
  skillName: string;
  requiredLevel: number; // 0–100
  userLevel: number; // mock user's current level
}

/** ISO 3166-1 alpha-2 country code for flag display */
export const COUNTRY_TO_ISO: Record<string, string> = {
  // Indonesian names (legacy)
  Jepang: "JP",
  "Korea Selatan": "KR",
  "Hong Kong": "HK",
  UAE: "AE",
  Singapura: "SG",
  // English names (from new data)
  Germany: "DE",
  Japan: "JP",
  "South Korea": "KR",
  "Hong Kong SAR": "HK",
  "United Arab Emirates": "AE",
  Singapore: "SG",
  Australia: "AU",
  Austria: "AT",
  Switzerland: "CH",
  Oman: "OM",
};

export interface TermsAndConditions {
  durationOfContract: string;
  annualLeave: string;
  probationPeriod: string;
  workingDays: string;
  workingHours: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  offTaker: "APJATI" | "Vokati" | "BINAWAN" | "Mitra Kerja Nusantara";
  country: string;
  countryFlag: string; // emoji
  countryCode?: string; // ISO code for flag icons
  sector: "Care Worker" | "Hospitality" | "Construction" | "Manufacturing" | "IT" | "Healthcare" | "Transportation";
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  postedAt: string; // ISO date
  deadline: string;
  positions: number;
  description: string;
  qualifications: string[];
  benefits: string[];
  isFunded: boolean;
  funderName?: string;
  fundingCoverage?: string;
  mpChannel?: "zenius" | "telkomsel";
  skillRequirements: SkillRequirement[];
  // Extended fields from new data
  employerInfo?: string;
  placement?: { city: string; state: string; country: string };
  termsAndConditions?: TermsAndConditions;
  documentRequirements?: string[];
  requiredSubcourses?: string[];
  /** External listing (e.g. Vokati) when apply flow is off-platform */
  externalJobUrl?: string;
  /** Portal/backend job lifecycle, e.g. `active` */
  status?: string;
}

export interface MarketingPartner {
  id: string;
  name: string;
  slug: "zenius" | "telkomsel" | "malaka" | "vokati" | "apjati";
  tagline: string;
  color: string;
  referralCount: number;
  activeJobCount: number;
  /** Override CTA link (e.g. for off-takers) */
  ctaHref?: string;
  /** Override CTA label */
  ctaLabel?: string;
}

export interface UserProfile {
  name: string;
  initials: string;
  location: string;
  role: "candidate" | "funder" | "admin";
  mpReferral: "zenius" | "telkomsel" | null;
  skills: Record<string, number>;
}

export interface FilterState {
  countries: string[];
  sectors: string[];
  fundedOnly: boolean;
  skillMatchOnly: boolean;
  sortBy: "latest" | "skill_match";
  viewMode: "grid" | "list";
}

export type MPSlug = "zenius" | "telkomsel";

export interface Application {
  jobId: string;
  appliedAt: string;
}
