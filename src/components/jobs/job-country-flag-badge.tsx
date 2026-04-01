import { COUNTRY_TO_ISO, type Job } from "@/types";

type JobFlagFields = Pick<Job, "country" | "countryFlag" | "countryCode" | "placement">;

function resolveIso(job: JobFlagFields): string | null {
  if (job.countryCode) return job.countryCode.toLowerCase();
  const fromCountry = COUNTRY_TO_ISO[job.country];
  if (fromCountry) return fromCountry.toLowerCase();
  const pc = job.placement?.country;
  if (pc && COUNTRY_TO_ISO[pc]) return COUNTRY_TO_ISO[pc].toLowerCase();
  return null;
}

interface JobCountryFlagBadgeProps {
  job: JobFlagFields;
  className?: string;
}

/**
 * Small rounded flag thumbnail (border, object-cover) via flagcdn; falls back to emoji.
 */
export function JobCountryFlagBadge({ job, className = "" }: JobCountryFlagBadgeProps) {
  const iso = resolveIso(job);
  const countryLabel = job.placement?.country ?? job.country;

  if (iso) {
    return (
      <span
        className={`relative inline-block h-8 w-12 overflow-hidden rounded-md border border-ink/20 bg-white shrink-0 ${className}`}
      >
        <img
          src={`https://flagcdn.com/w80/${iso}.png`}
          alt={`Bendera ${countryLabel}`}
          width={80}
          height={53}
          className="h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex h-8 w-12 items-center justify-center rounded-md border border-ink/20 bg-app-bg text-lg leading-none shrink-0 ${className}`}
      aria-hidden
    >
      {job.countryFlag}
    </span>
  );
}
