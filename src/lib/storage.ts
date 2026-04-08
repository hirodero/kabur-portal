import type { UserProfile, FilterState, Application, MPSlug } from "@/types";

export const STORAGE_KEYS = {
  USER_PROFILE: "pmi_user_profile",
  APPLICATIONS: "pmi_applications",
  BOOKMARKS: "pmi_bookmarks",
  MP_REFERRAL: "pmi_mp_referral",
  FILTERS: "pmi_filters",
  MP_BANNER_DISMISSED: "pmi_mp_banner_dismissed",
  FUNDER_MODE: "pmi_funder_mode",
  QUALIFIED_USERS: "pmi_qualified_users",
} as const;

const DEFAULT_USER: UserProfile = {
  name: "Budi Santoso",
  initials: "BS",
  location: "Jawa Timur",
  role: "candidate",
  mpReferral: "zenius",
  skills: {
    "Basic Thinking Skills": 45,
    "Understanding and Be Effective with Others": 60,
    "Basic Decision-Making": 30,
    "Productivity and Management Skills": 55,
    "Business and Economics for Everyone": 35,
    "Communication in Japanese/Korean/English": 20,
  },
};

function normalizeUserProfile(profile: Partial<UserProfile> | null): UserProfile {
  return {
    ...DEFAULT_USER,
    ...profile,
    role: profile?.role ?? "candidate",
  };
}

const DEFAULT_FILTERS: FilterState = {
  countries: [],
  sectors: [],
  fundedOnly: false,
  skillMatchOnly: false,
  sortBy: "latest",
  viewMode: "grid", // default card view when accessing /jobs
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage might be full or unavailable
  }
}

function removeItem(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

// User Profile
export function getUserProfile(): UserProfile {
  return normalizeUserProfile(getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE));
}

export function setUserProfile(profile: UserProfile): void {
  setItem(STORAGE_KEYS.USER_PROFILE, profile);
}

export function initUserProfile(): UserProfile {
  if (!isBrowser()) return DEFAULT_USER;
  const existing = getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  const normalized = normalizeUserProfile(existing);
  if (!existing || existing.role === undefined) {
    setItem(STORAGE_KEYS.USER_PROFILE, normalized);
    setItem(STORAGE_KEYS.MP_REFERRAL, normalized.mpReferral);
  }
  return normalized;
}

// Applications
export function getApplications(): Application[] {
  return getItem<Application[]>(STORAGE_KEYS.APPLICATIONS) ?? [];
}

export function addApplication(jobId: string): void {
  const apps = getApplications();
  const alreadyApplied = apps.some((a) => a.jobId === jobId);
  if (!alreadyApplied) {
    setItem(STORAGE_KEYS.APPLICATIONS, [
      ...apps,
      { jobId, appliedAt: new Date().toISOString() },
    ]);
  }
}

export function hasApplied(jobId: string): boolean {
  return getApplications().some((a) => a.jobId === jobId);
}

// Bookmarks
export function getBookmarks(): string[] {
  return getItem<string[]>(STORAGE_KEYS.BOOKMARKS) ?? [];
}

export function toggleBookmark(jobId: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(jobId);
  if (idx === -1) {
    setItem(STORAGE_KEYS.BOOKMARKS, [...bookmarks, jobId]);
    return true;
  } else {
    setItem(
      STORAGE_KEYS.BOOKMARKS,
      bookmarks.filter((id) => id !== jobId)
    );
    return false;
  }
}

export function isBookmarked(jobId: string): boolean {
  return getBookmarks().includes(jobId);
}

// MP Referral
export function getMPReferral(): MPSlug | null {
  return getItem<MPSlug>(STORAGE_KEYS.MP_REFERRAL);
}

export function setMPReferral(slug: MPSlug): void {
  setItem(STORAGE_KEYS.MP_REFERRAL, slug);
}

// MP Banner dismissed
export function isMPBannerDismissed(): boolean {
  return getItem<boolean>(STORAGE_KEYS.MP_BANNER_DISMISSED) ?? false;
}

export function dismissMPBanner(): void {
  setItem(STORAGE_KEYS.MP_BANNER_DISMISSED, true);
}

// Filters (normalize legacy "funded_first" from old localStorage)
export function getFilters(): FilterState {
  const stored = getItem<FilterState & { sortBy?: string }>(STORAGE_KEYS.FILTERS) ?? DEFAULT_FILTERS;
  const validSortBy: FilterState["sortBy"] =
    stored.sortBy === "skill_match" ? "skill_match" : "latest";
  return { ...stored, sortBy: validSortBy } as FilterState;
}

export function setFilters(filters: FilterState): void {
  setItem(STORAGE_KEYS.FILTERS, filters);
}

export function resetFilters(): void {
  removeItem(STORAGE_KEYS.FILTERS);
}

// Funder Mode
export function getFunderMode(): boolean {
  return getItem<boolean>(STORAGE_KEYS.FUNDER_MODE) ?? false;
}

export function setFunderMode(value: boolean): void {
  setItem(STORAGE_KEYS.FUNDER_MODE, value);
}

// Seeded mock qualified users — realistic distribution across 22 jobs
const MOCK_QUALIFIED_USERS: Record<string, number> = {
  job_001: 14, job_002: 8,  job_003: 21, job_004: 6,  job_005: 17,
  job_006: 11, job_007: 3,  job_008: 25, job_009: 9,  job_010: 19,
  job_011: 5,  job_012: 13, job_013: 28, job_014: 7,  job_015: 16,
  job_016: 22, job_017: 4,  job_018: 12, job_019: 31, job_020: 10,
  job_021: 18, job_022: 8,
};

// Qualified users per job: Record<jobId, count>
export function getQualifiedUsers(): Record<string, number> {
  return getItem<Record<string, number>>(STORAGE_KEYS.QUALIFIED_USERS) ?? {};
}

export function initQualifiedUsers(): void {
  if (!isBrowser()) return;
  const existing = getItem<Record<string, number>>(STORAGE_KEYS.QUALIFIED_USERS);
  if (!existing) {
    setItem(STORAGE_KEYS.QUALIFIED_USERS, MOCK_QUALIFIED_USERS);
  }
}

export function addQualifiedUser(jobId: string): number {
  const current = getQualifiedUsers();
  const next = { ...current, [jobId]: (current[jobId] ?? 0) + 1 };
  setItem(STORAGE_KEYS.QUALIFIED_USERS, next);
  return next[jobId];
}

export function removeQualifiedUser(jobId: string): number {
  const current = getQualifiedUsers();
  const newCount = Math.max(0, (current[jobId] ?? 0) - 1);
  const next = { ...current, [jobId]: newCount };
  setItem(STORAGE_KEYS.QUALIFIED_USERS, next);
  return newCount;
}
