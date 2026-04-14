import {
  getPortalApiV1BaseUrlOnServer,
  getPortalApiV1Pathname,
} from "@/lib/portal-api-config";

/**
 * Same-origin path under the v1 API (works with `next.config` rewrites). See PORTAL_API.md.
 * Use for `<Link href>` or browser-only `fetch` — not for Server Component `fetch` (use `resolvePortalFetchUrl`).
 */
export function portalApiPath(suffix: string): string {
  const prefix = getPortalApiV1Pathname();
  const s = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `${prefix}${s}`;
}

/**
 * URL passed to `fetch()`: relative in the browser; **absolute** on the server because
 * Node/undici rejects relative URLs when there is no request base (e.g. RSC / route handlers).
 */
export function resolvePortalFetchUrl(pathSuffix: string): string {
  const relative = portalApiPath(pathSuffix);
  if (typeof window !== "undefined") {
    return relative;
  }
  const base = getPortalApiV1BaseUrlOnServer();
  if (base) {
    const s = pathSuffix.startsWith("/") ? pathSuffix : `/${pathSuffix}`;
    return `${base}${s}`;
  }
  const selfOrigin = process.env.NEXTAUTH_URL?.trim().replace(/\/$/, "");
  if (selfOrigin) {
    return `${selfOrigin}${relative}`;
  }
  throw new Error(
    "Portal API: set PORTAL_API_URL or NEXT_PUBLIC_PORTAL_API_URL for server fetch, or NEXTAUTH_URL to use same-origin rewrites.",
  );
}

/** Optional BFF retry: mirrors portal-token when JWT still holds a Google id_token. */
export async function syncPortalAuthCookieFromSession(): Promise<boolean> {
  const res = await fetch("/api/auth/portal/google-callback", {
    method: "POST",
    credentials: "include",
  });
  return res.status === 204;
}
