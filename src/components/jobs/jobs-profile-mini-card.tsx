import type { UserProfile } from "@/types";
import { cn } from "@/lib/utils";

interface JobsProfileMiniCardProps {
  user: Pick<UserProfile, "initials" | "name" | "location">;
  className?: string;
}

export function JobsProfileMiniCard({ user, className }: JobsProfileMiniCardProps) {
  return (
    <div className={cn("bg-white border border-ink/10 rounded-card p-4", className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-primary rounded-card flex items-center justify-center text-white font-jakarta font-bold text-xs shrink-0">
          {user.initials}
        </div>
        <div>
          <p className="font-jakarta font-semibold text-sm text-ink">{user.name}</p>
          <p className="font-jakarta text-xs text-ink-muted">{user.location}</p>
        </div>
      </div>
    </div>
  );
}
