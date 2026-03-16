export interface SkillRequirement {
  skillName: string;
  requiredLevel: number; // 0–100
  userLevel: number; // mock user's current level
}

/** ISO 3166-1 alpha-2 country code for flag display (e.g. JP, KR, AE) */
export const COUNTRY_TO_ISO: Record<string, string> = {
  Jepang: "JP",
  "Korea Selatan": "KR",
  "Hong Kong": "HK",
  UAE: "AE",
  Singapura: "SG",
};

export interface Job {
  id: string;
  title: string;
  company: string;
  offTaker: "APJATI" | "Vokati";
  country: string;
  countryFlag: string; // emoji (legacy)
  countryCode?: string; // ISO code for flag icons
  sector: "Care Worker" | "Hospitality" | "Construction" | "Manufacturing" | "IT";
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
  fundingCoverage?: string; // e.g. "Biaya training penuh (Rp 8.500.000)"
  mpChannel?: "zenius" | "telkomsel";
  skillRequirements: SkillRequirement[];
  isJobFair: boolean;
  jobFairEventId?: string;
}

export interface MarketingPartner {
  id: string;
  name: string;
  slug: "zenius" | "telkomsel";
  tagline: string;
  color: string; // brand color hex
  referralCount: number;
  activeJobCount: number;
}

export interface JobFairEmployer {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  sector: string;
  isFunded: boolean;
  jobCount: number;
  jobTitles: string[];
  description: string;
  jobIds: string[]; // references to jobs in the jobs array
}

export interface JobFairEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isUpcoming: boolean;
  employerCount: number;
  positionCount: number;
  employers: JobFairEmployer[];
}

export interface UserProfile {
  name: string;
  initials: string;
  location: string;
  mpReferral: "zenius" | "telkomsel" | null;
  skills: Record<string, number>;
}

export interface FilterState {
  countries: string[];
  sectors: string[];
  fundedOnly: boolean;
  skillMatchOnly: boolean;
  sortBy: "latest" | "skill_match" | "funded_first";
  viewMode: "grid" | "list";
}

export type MPSlug = "zenius" | "telkomsel";

export interface Application {
  jobId: string;
  appliedAt: string;
}
