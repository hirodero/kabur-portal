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

      {/* Gap callout */}
      {!allMet && (
        <div className="bg-primary-light border border-primary/20 rounded-card p-3 space-y-2">
          <p className="font-jakarta text-xs font-semibold text-primary">
            Tingkatkan skill kamu di ZenLeap sebelum apply
          </p>
          <div className="space-y-1">
            {skillRequirements
              .filter((s) => s.userLevel < s.requiredLevel)
              .map((s) => (
                <a
                  key={s.skillName}
                  href={`https://zenleap.id/course/${getSkillSlug(s.skillName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between font-jakarta text-[11px] text-primary font-medium hover:underline"
                >
                  <span>{s.skillName}</span>
                  <span className="text-[10px] bg-white text-primary border border-primary/20 px-1.5 py-0.5 rounded-badge">
                    -{s.requiredLevel - s.userLevel} poin
                  </span>
                </a>
              ))}
          </div>
          <a
            href="https://zenleap.id"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-center font-jakarta text-xs font-semibold bg-primary text-white rounded-btn py-2 hover:bg-primary-dark transition-colors active:scale-[0.97]"
          >
            Mulai training di ZenLeap →
          </a>
        </div>
      )}
    </div>
  );
}
