import { cookies } from "next/headers";
import { getAuthGoogleCallbackUrlOnServer } from "@/lib/portal-api-config";

interface ParsedSetCookie {
  name: string;
  value: string;
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

function parseSetCookieLine(line: string): ParsedSetCookie {
  const segments = line.split(";").map((s) => s.trim());
  const [pair, ...attrs] = segments;
  const eq = pair.indexOf("=");
  const name = pair.slice(0, eq).trim();
  let value = pair.slice(eq + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  const out: ParsedSetCookie = { name, value, path: "/" };
  for (const a of attrs) {
    const [k, ...rest] = a.split("=");
    const key = k.trim().toLowerCase();
    const val = rest.join("=").trim();
    if (key === "httponly") out.httpOnly = true;
    else if (key === "secure") out.secure = true;
    else if (key === "path") out.path = val;
    else if (key === "domain") continue;
    else if (key === "max-age") {
      const n = Number.parseInt(val, 10);
      if (!Number.isNaN(n)) out.maxAge = n;
    } else if (key === "samesite") {
      const v = val.toLowerCase();
      if (v === "strict" || v === "lax" || v === "none") out.sameSite = v;
    }
  }
  return out;
}

function getSetCookieLines(res: Response): string[] {
  const fromFn = res.headers.getSetCookie?.();
  if (fromFn && fromFn.length > 0) return fromFn;
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

/**
 * Mirrors `portal-token` from the backend response onto the current Next.js origin
 * (host-only cookie; Domain from upstream is ignored).
 */
export async function mirrorPortalTokenFromResponse(res: Response): Promise<boolean> {
  const lines = getSetCookieLines(res);
  const cookieStore = await cookies();
  let mirrored = false;
  for (const line of lines) {
    const parsed = parseSetCookieLine(line);
    if (parsed.name !== "portal-token") continue;
    cookieStore.set(parsed.name, parsed.value, {
      httpOnly: parsed.httpOnly ?? true,
      secure: parsed.secure,
      sameSite: parsed.sameSite ?? "lax",
      path: parsed.path ?? "/",
      ...(parsed.maxAge !== undefined ? { maxAge: parsed.maxAge } : {}),
    });
    mirrored = true;
  }
  return mirrored;
}

/**
 * Server-side exchange: POST Google OIDC id_token to the portal API and mirror
 * `portal-token` onto this app's cookies (same origin as the page).
 */
export async function exchangeGoogleIdTokenForPortalCookie(
  idToken: string,
): Promise<
  { ok: true; mirrored: boolean } | { ok: false; status: number; detail?: string }
> {
  const url = getAuthGoogleCallbackUrlOnServer();
  if (!url) {
    return {
      ok: false,
      status: 500,
      detail: "PORTAL_API_URL or NEXT_PUBLIC_PORTAL_API_URL is not configured",
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      detail: text.slice(0, 200) || undefined,
    };
  }

  const mirrored = await mirrorPortalTokenFromResponse(res);
  if (!mirrored) {
    console.warn(
      "Portal auth: callback succeeded but no portal-token Set-Cookie was mirrored",
    );
  }

  return { ok: true, mirrored };
}
