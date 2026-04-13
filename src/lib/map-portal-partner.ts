import type { MarketingPartner } from "@/types";

const SLUGS = ["zenius", "telkomsel", "malaka", "vokati", "apjati"] as const;

function inferSlug(name: string): (typeof SLUGS)[number] {
  const s = name.toLowerCase();
  for (const slug of SLUGS) {
    if (s.includes(slug)) return slug;
  }
  return "apjati";
}

function asRecord(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null) return {};
  return raw as Record<string, unknown>;
}

/**
 * Maps portal marketing partner JSON into UI `MarketingPartner` for `MPCard`.
 */
export function mapPortalMarketingPartnerToUi(raw: unknown): MarketingPartner {
  const r = asRecord(raw);
  const name =
    typeof r.name === "string" && r.name.length > 0 ? r.name : "Mitra";
  const id =
    typeof r._id === "string" && r._id.length > 0 ? r._id : name.toLowerCase();
  const slug = inferSlug(name);
  const tagline =
    typeof r.tagline === "string" && r.tagline.length > 0
      ? r.tagline
      : "Mitra resmi ekosistem #KaburPortal.";
  const color =
    typeof r.color === "string" && r.color.length > 0 ? r.color : "#C8102E";

  return {
    id,
    name,
    slug,
    tagline,
    color,
    referralCount:
      typeof r["referral-count"] === "number"
        ? r["referral-count"]
        : typeof r.referralCount === "number"
          ? r.referralCount
          : 0,
    activeJobCount:
      typeof r["active-job-count"] === "number"
        ? r["active-job-count"]
        : typeof r.activeJobCount === "number"
          ? r.activeJobCount
          : 0,
    ctaHref: typeof r.ctaHref === "string" ? r.ctaHref : undefined,
    ctaLabel: typeof r.ctaLabel === "string" ? r.ctaLabel : undefined,
  };
}
