import { getPortalApiV1Pathname } from "@/lib/portal-api-config";

/**
 * Same-origin path under the v1 API (works with `next.config` rewrites). See PORTAL_API.md.
 * Use with `fetch(..., { credentials: "include" })` for cookie-authenticated routes.
 */
export function portalApiPath(suffix: string): string {
  const prefix = getPortalApiV1Pathname();
  const s = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `${prefix}${s}`;
}

/** Optional BFF retry: mirrors portal-token when JWT still holds a Google id_token. */
export async function syncPortalAuthCookieFromSession(): Promise<boolean> {
  const res = await fetch("/api/auth/portal/google-callback", {
    method: "POST",
    credentials: "include",
  });
  return res.status === 204;
}
