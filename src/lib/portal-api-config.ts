/**
 * Portal API base paths — aligned with PORTAL_API.md:
 * `{origin}{SERVER_PATH}portal-api/v1` (v1 prefix is the contract for this frontend).
 */

export const PORTAL_API_V1_DEFAULT_PATH = "/portal-api/v1";

/**
 * Pathname of the v1 API on the backend (leading slash, no trailing slash), e.g. `/portal-api/v1`.
 * Prefer `NEXT_PUBLIC_PORTAL_API_URL` so it stays in sync with deployed `SERVER_PATH` + version.
 */
export function getPortalApiV1Pathname(): string {
  const pub = process.env.NEXT_PUBLIC_PORTAL_API_URL?.trim();
  if (pub) {
    try {
      const normalized = pub.startsWith("http") ? pub : `http://${pub}`;
      const pathname = new URL(normalized).pathname.replace(/\/$/, "");
      return pathname && pathname !== "/" ? pathname : PORTAL_API_V1_DEFAULT_PATH;
    } catch {
      return PORTAL_API_V1_DEFAULT_PATH;
    }
  }
  const override = process.env.PORTAL_API_V1_PATH?.trim();
  if (override) {
    const withSlash = override.startsWith("/") ? override : `/${override}`;
    return withSlash.replace(/\/$/, "") || PORTAL_API_V1_DEFAULT_PATH;
  }
  return PORTAL_API_V1_DEFAULT_PATH;
}

/** Backend origin only (no path), e.g. `http://localhost:3000` */
export function resolvePortalBackendOrigin(): string | null {
  const explicit = process.env.PORTAL_API_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const pub = process.env.NEXT_PUBLIC_PORTAL_API_URL?.trim();
  if (!pub) return null;
  try {
    const normalized = pub.startsWith("http") ? pub : `http://${pub}`;
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}

/**
 * Full base URL for v1 on the server (no trailing slash), e.g. `http://localhost:3000/portal-api/v1`.
 */
export function getPortalApiV1BaseUrlOnServer(): string | null {
  const pub = process.env.NEXT_PUBLIC_PORTAL_API_URL?.trim();
  if (pub) {
    try {
      const normalized = pub.startsWith("http") ? pub : `http://${pub}`;
      const u = new URL(normalized);
      const path = u.pathname.replace(/\/$/, "");
      const basePath = path && path !== "/" ? path : PORTAL_API_V1_DEFAULT_PATH;
      return `${u.origin}${basePath}`;
    } catch {
      /* fall through */
    }
  }
  const origin = resolvePortalBackendOrigin();
  if (!origin) return null;
  return `${origin}${getPortalApiV1Pathname()}`;
}

/** `POST …/auth/google/callback` — see PORTAL_API.md */
export function getAuthGoogleCallbackUrlOnServer(): string | null {
  const base = getPortalApiV1BaseUrlOnServer();
  return base ? `${base}/auth/google/callback` : null;
}

/** Path segments after the v1 base (`/portal-api/v1`). Use with `portalApiPath()`. */
export const portalApiRoutes = {
  v1Index: "",
  healthz: "/healthz",
  readyz: "/readyz",
  authGoogleCallback: "/auth/google/callback",
  authLogout: "/auth/logout",
  authMe: "/auth/me",
  jobs: "/jobs",
  job: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}`,
  jobSimilar: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/similar`,
  metadataFilters: "/metadata/filters",
  meProfile: "/me/profile",
  meSkills: "/me/skills",
  meApplications: "/me/applications",
  jobApplications: (jobId: string) =>
    `/jobs/${encodeURIComponent(jobId)}/applications`,
  meBookmarks: "/me/bookmarks",
  jobBookmark: (jobId: string) =>
    `/jobs/${encodeURIComponent(jobId)}/bookmark`,
  marketingPartners: "/marketing-partners",
  offtakers: "/offtakers",
} as const;
