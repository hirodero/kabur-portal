import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { exchangeGoogleIdTokenForPortalCookie } from "@/lib/portal-auth-exchange";

/**
 * Same-origin POST with `credentials: 'include'`.
 * Reads Google `id_token` from the Auth.js JWT (set when portal-token was not mirrored during OAuth).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "auth_misconfigured" }, { status: 500 });
  }

  const token = await getToken({
    req: request,
    secret,
    secureCookie: process.env.NEXTAUTH_URL?.startsWith("https://"),
  });

  const idToken = typeof token?.idToken === "string" ? token.idToken : undefined;
  if (!idToken) {
    return NextResponse.json({ error: "missing_id_token" }, { status: 401 });
  }

  const result = await exchangeGoogleIdTokenForPortalCookie(idToken);
  if (!result.ok) {
    return NextResponse.json(
      { error: "exchange_failed", detail: result.detail },
      { status: result.status >= 400 && result.status < 600 ? result.status : 502 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
