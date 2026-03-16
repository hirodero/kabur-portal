import Link from "next/link";
import Image from "next/image";
import type { MarketingPartner } from "@/types";

const MP_LOGOS: Record<string, string> = {
  zenius: "/zenius.png",
  telkomsel: "/telkomsel.png",
};

interface MPCardProps {
  partner: MarketingPartner;
}

export function MPCard({ partner }: MPCardProps) {
  const logo = partner.slug ? MP_LOGOS[partner.slug] : undefined;

  return (
    <div className="bg-white border border-ink/8 rounded-card p-6 flex flex-col hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200">
      {/* Logo */}
      <span className="flex items-center justify-center w-12 h-10 rounded-lg border border-ink/20 bg-white overflow-hidden shrink-0 p-1.5">
        {logo ? (
          <Image
            src={logo}
            alt={partner.name}
            width={48}
            height={32}
            className="object-contain w-full h-full"
          />
        ) : (
          <div
            className="w-full h-full rounded flex items-center justify-center text-white font-jakarta font-bold text-xs"
            style={{ backgroundColor: partner.color }}
          >
            {partner.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </span>

      {/* Name */}
      <h4 className="font-jakarta font-semibold text-lg text-ink mt-3">
        {partner.name}
      </h4>

      {/* Tagline */}
      <p className="text-sm text-ink-muted mt-1 leading-relaxed flex-1">
        {partner.tagline}
      </p>

      {/* Stats row */}
      <div className="flex gap-4 mt-3">
        <span className="text-[11px] text-ink-muted">
          {partner.referralCount.toLocaleString("id-ID")} referral
        </span>
        <span className="text-[11px] text-ink-muted">
          {partner.activeJobCount} lowongan aktif
        </span>
      </div>

      {/* CTA */}
      <Link
        href={`/home?mp=${partner.slug}`}
        className="mt-4 text-xs text-primary font-medium hover:underline"
      >
        → Lihat channel
      </Link>
    </div>
  );
}
