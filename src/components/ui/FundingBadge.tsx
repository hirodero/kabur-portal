import { CheckmarkCircle02Icon } from "hugeicons-react";

interface FundingBadgeProps {
  funderName?: string;
  fundingCoverage?: string;
  variant?: "badge" | "callout";
}

export function FundingBadge({
  funderName,
  fundingCoverage,
  variant = "badge",
}: FundingBadgeProps) {
  if (variant === "callout") {
    return (
      <div className="bg-funded-light border border-funded/20 rounded-card p-4 flex gap-3">
        <CheckmarkCircle02Icon size={20} className="text-funded shrink-0 mt-0.5" />
        <div>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 bg-funded-light text-funded-dark border border-funded/20 text-[10px] px-2 py-0.5 rounded-badge font-medium font-jakarta">
      <CheckmarkCircle02Icon size={11} />
      Funded
    </span>
  );
}
