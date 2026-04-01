"use client";

import { JobsFilterPanel, type JobsFilterPanelProps } from "@/components/jobs/jobs-filter-panel";

export function JobsSidebarFilterCard(props: JobsFilterPanelProps) {
  return (
    <div className="bg-white border border-ink/10 rounded-card p-4">
      <h3 className="font-jakarta font-semibold text-[10px] uppercase tracking-widest text-ink-muted mb-4">
        Filter
      </h3>
      <JobsFilterPanel {...props} />
    </div>
  );
}
