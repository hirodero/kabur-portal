"use client";

import { motion } from "framer-motion";

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
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-ink">{skillName}</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-medium ${
              hasGap ? "text-primary" : "text-funded"
            }`}
          >
            {userLevel}/{requiredLevel}
          </span>
          {showGapPill && hasGap && (
            <span className="text-[10px] font-semibold bg-primary-light text-primary border border-primary/20 px-1.5 py-0.5 rounded-badge">
              -{gap}
            </span>
          )}
        </div>
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

      {showZenLeapLink && hasGap && (
        <motion.a
          href="https://zenleap.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-block text-[11px] text-primary font-medium"
          initial="rest"
          whileHover="hover"
          variants={{ rest: {}, hover: {} }}
        >
          Tingkatkan via ZenLeap →
          <motion.span
            className="absolute left-0 bottom-0 h-px w-full bg-primary"
            style={{ transformOrigin: "left" }}
            variants={{
              rest: { scaleX: 0 },
              hover: { scaleX: 1 },
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </motion.a>
      )}
    </div>
  );
}
