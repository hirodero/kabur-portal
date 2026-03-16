import type { UserProfile, FilterState, Application, MPSlug } from "@/types";

export const STORAGE_KEYS = {
  USER_PROFILE: "pmi_user_profile",
  APPLICATIONS: "pmi_applications",
  BOOKMARKS: "pmi_bookmarks",
  JOB_FAIR_BOOKMARKS: "pmi_jf_bookmarks",
  MP_REFERRAL: "pmi_mp_referral",
  FILTERS: "pmi_filters",
  MP_BANNER_DISMISSED: "pmi_mp_banner_dismissed",
} as const;

const DEFAULT_USER: UserProfile = {
  name: "Budi Santoso",
  initials: "BS",
  location: "Jawa Timur",
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

const DEFAULT_FILTERS: FilterState = {
  countries: [],
  sectors: [],
  fundedOnly: false,
  skillMatchOnly: false,
  sortBy: "latest",
  viewMode: "grid", // default card view when accessing /home
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
  return getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE) ?? DEFAULT_USER;
}

export function setUserProfile(profile: UserProfile): void {
  setItem(STORAGE_KEYS.USER_PROFILE, profile);
}

export function initUserProfile(): UserProfile {
  if (!isBrowser()) return DEFAULT_USER;
  const existing = getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  if (!existing) {
    setItem(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER);
    setItem(STORAGE_KEYS.MP_REFERRAL, DEFAULT_USER.mpReferral);
  }
  return existing ?? DEFAULT_USER;
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

// Job Fair Bookmarks
export function getJobFairBookmarks(): string[] {
  return getItem<string[]>(STORAGE_KEYS.JOB_FAIR_BOOKMARKS) ?? [];
}

export function toggleJobFairBookmark(jobId: string): boolean {
  const bookmarks = getJobFairBookmarks();
  const idx = bookmarks.indexOf(jobId);
  if (idx === -1) {
    setItem(STORAGE_KEYS.JOB_FAIR_BOOKMARKS, [...bookmarks, jobId]);
    return true;
  } else {
    setItem(
      STORAGE_KEYS.JOB_FAIR_BOOKMARKS,
      bookmarks.filter((id) => id !== jobId)
    );
    return false;
  }
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

// Filters
export function getFilters(): FilterState {
  return getItem<FilterState>(STORAGE_KEYS.FILTERS) ?? DEFAULT_FILTERS;
}

export function setFilters(filters: FilterState): void {
  setItem(STORAGE_KEYS.FILTERS, filters);
}

export function resetFilters(): void {
  removeItem(STORAGE_KEYS.FILTERS);
}
