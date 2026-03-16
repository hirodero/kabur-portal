"use client";

import { useState, useEffect } from "react";
import { Cancel01Icon } from "hugeicons-react";
import { Button } from "@heroui/react";
import { getMPReferral, isMPBannerDismissed, dismissMPBanner } from "@/lib/storage";
import type { MPSlug } from "@/types";

const MP_CONFIG: Record<
  MPSlug,
  { label: string; tagline: string; color: string; bg: string }
> = {
  zenius: {
    label: "Zenius",
    tagline: "Anda masuk melalui program Zenius × #KaburPortal",
    color: "#E4002B",
    bg: "#E4002B",
  },
  telkomsel: {
    label: "Telkomsel",
    tagline: "Anda masuk melalui program Telkomsel × #KaburPortal",
    color: "#E4002B",
    bg: "#E4002B",
  },
};

export function MPChannelBanner() {
  const [visible, setVisible] = useState(false);
  const [mpSlug, setMpSlug] = useState<MPSlug | null>(null);

  useEffect(() => {
    const slug = getMPReferral();
    const dismissed = isMPBannerDismissed();
    if (slug && !dismissed) {
      setMpSlug(slug);
      setVisible(true);
    }
  }, []);

  function handleDismiss() {
    dismissMPBanner();
    setVisible(false);
  }

  if (!visible || !mpSlug) return null;

  const config = MP_CONFIG[mpSlug];

  return (
    <div
      className="rounded-card px-4 py-3 flex items-center justify-between gap-3 mb-4"
      style={{ backgroundColor: config.bg }}
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-white/20 rounded shrink-0 flex items-center justify-center">
          <span className="font-jakarta text-xs font-bold text-white" aria-hidden>
            {config.label[0]}
          </span>
        </div>
        <p className="font-jakarta text-sm font-medium text-white">{config.tagline}</p>
      </div>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onClick={handleDismiss}
        aria-label="Tutup banner"
        className="min-w-8 w-8 h-8 text-white/70 hover:text-white hover:bg-white/10 shrink-0"
      >
        <Cancel01Icon size={16} />
      </Button>
    </div>
  );
}
