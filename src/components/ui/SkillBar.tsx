"use client";

import { ZenLeapCtaButton } from "@/components/ui/zenleap-cta-button";

interface SkillBarProps {
  skillName: string;
  userLevel: number;
  requiredLevel: number;
  showGapPill?: boolean;
  showZenLeapLink?: boolean;
}

export function SkillBar({
  skillName,
  userLevel,
  requiredLevel,
  showGapPill = true,
  showZenLeapLink = false,
}: SkillBarProps) {
  const hasGap = userLevel < requiredLevel;
  const gap = requiredLevel - userLevel;

  return (
    <div className="space-y-1.5 min-w-0">
      {/* Name + score + gap pill — all inline, wraps gracefully */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1.5 min-w-0">
        <span className="text-xs font-medium text-ink leading-snug">{skillName}</span>
        <span className={`text-[11px] font-medium shrink-0 ${hasGap ? "text-primary" : "text-funded"}`}>
          {userLevel}/{requiredLevel}
        </span>
        {showGapPill && hasGap && (
          <span className="text-[10px] font-semibold bg-primary-light text-primary border border-primary/20 px-1.5 py-0.5 rounded-badge shrink-0">
            -{gap}
          </span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-1.5 bg-ink/8 rounded-full overflow-visible">
        {/* User level fill */}
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${
            hasGap ? "bg-primary" : "bg-funded"
          }`}
          style={{ width: `${Math.min(userLevel, 100)}%` }}
        />
        {/* Required level marker — thin vertical line */}
        <div
          className="absolute -top-1 w-0.5 h-3.5 bg-ink/30 rounded-full"
          style={{ left: `${Math.min(requiredLevel, 100)}%` }}
        />
      </div>

      {showZenLeapLink && hasGap && <ZenLeapCtaButton className="mt-0.5" />}
    </div>
  );
}
