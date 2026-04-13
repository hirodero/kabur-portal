import type { NextConfig } from "next";
import {
  getPortalApiV1Pathname,
  resolvePortalBackendOrigin,
} from "./src/lib/portal-api-config";

/**
 * Same-origin proxy (Opsi A): browser hits `{v1}/…` on the Next host; rewrites to
 * `{PORTAL_API_URL}{v1}/…`. See PORTAL_API.md (CORS / cookies).
 */
function getPortalApiRewrites(): Array<{ source: string; destination: string }> {
  const origin = resolvePortalBackendOrigin();
  if (!origin) return [];
  const apiPath = getPortalApiV1Pathname();
  return [
    {
      source: `${apiPath}/:path*`,
      destination: `${origin}${apiPath}/:path*`,
    },
  ];
}

const nextConfig: NextConfig = {
  async rewrites() {
    return getPortalApiRewrites();
  },
};

export default nextConfig;
