import { SkillBar } from "@/components/ui/SkillBar";
import type { SkillRequirement } from "@/types";

interface SkillGapPanelProps {
  skillRequirements: SkillRequirement[];
}

function getSkillSlug(skillName: string): string {
  return skillName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-");
}

export function SkillGapPanel({ skillRequirements }: SkillGapPanelProps) {
  const metCount = skillRequirements.filter(
    (s) => s.userLevel >= s.requiredLevel
  ).length;
  const totalCount = skillRequirements.length;
  const allMet = metCount === totalCount;

  return (
    <div className="bg-white border border-ink/10 rounded-card p-5">
      <h3 className="font-jakarta font-semibold text-sm mb-4 text-ink">
        Persyaratan Skill
      </h3>

      {/* Skill bars */}
      <div className="space-y-4 mb-4">
        {skillRequirements.map((skill) => (
          <SkillBar
            key={skill.skillName}
            skillName={skill.skillName}
            userLevel={skill.userLevel}
            requiredLevel={skill.requiredLevel}
            showGapPill
            showZenLeapLink={false}
          />
        ))}
      </div>

      {/* Met counter */}
      <div className="font-jakarta text-xs font-medium mb-4">
        <span className={allMet ? "text-funded" : "text-primary"}>
          {metCount} dari {totalCount} skill terpenuhi
        </span>
      </div>

      
    </div>
  );
}
