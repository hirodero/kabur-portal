"use client";

import { SkillBar } from "@/components/ui/SkillBar";
import { Pagination } from "@/components/ui/pagination";

export interface JobsSidebarSkillRow {
  skillName: string;
  userLevel: number;
  requiredLevel: number;
}

interface JobsSidebarSkillsPanelProps {
  skills: JobsSidebarSkillRow[];
  skillTotalPages: number;
  skillCurrentPage: number;
  onSkillPageChange: (page: number) => void;
}

export function JobsSidebarSkillsPanel({
  skills,
  skillTotalPages,
  skillCurrentPage,
  onSkillPageChange,
}: JobsSidebarSkillsPanelProps) {
  return (
    <div className="bg-white border border-ink/10 rounded-card p-4 min-w-0 overflow-hidden">
      <h3 className="font-jakarta font-semibold text-[10px] uppercase tracking-widest text-ink-muted mb-4">
        Skill Kamu
      </h3>
      <div className="space-y-4 min-w-0 overflow-hidden">
        {skills.map((skill) => (
          <SkillBar
            key={skill.skillName}
            skillName={skill.skillName}
            userLevel={skill.userLevel}
            requiredLevel={skill.requiredLevel}
            showGapPill
            showZenLeapLink
          />
        ))}
      </div>
      {skillTotalPages > 1 && (
        <div className="mt-4 min-w-0 overflow-hidden">
          <Pagination
            currentPage={skillCurrentPage}
            totalPages={skillTotalPages}
            onPageChange={onSkillPageChange}
            compact
          />
        </div>
      )}
    </div>
  );
}
