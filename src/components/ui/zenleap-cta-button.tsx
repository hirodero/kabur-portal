import { cn } from "@/lib/utils";

/**
 * CTA button adapted from Uiverse.io — alexmaracinaru / empty-moose-12 (MIT).
 * https://uiverse.io/alexmaracinaru/empty-moose-12
 */
interface ZenLeapCtaButtonProps {
  className?: string;
}

export function ZenLeapCtaButton({ className }: ZenLeapCtaButtonProps) {
  return (
    <a
      href="https://zenleap.id/"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center border-0 bg-transparent p-0 font-jakarta cursor-pointer",
        "active:[&_svg]:scale-90",
        className
      )}
    >
      <span
        className={cn(
          "relative inline-block pb-1.5 pr-2 text-[11px] font-semibold text-primary",
          "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary",
          "after:origin-bottom-right after:scale-x-0 after:transition-transform after:duration-[250ms] after:ease-out",
          "group-hover:after:origin-bottom-left group-hover:after:scale-x-100"
        )}
      >
        Tingkatkan via ZenLeap
      </span>
      <svg
        viewBox="0 0 46 16"
        height={6}
        width={16}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0 -translate-x-1 fill-primary transition-transform duration-300 ease-in-out group-hover:translate-x-0"
      >
        <path
          transform="translate(30)"
          d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
        />
      </svg>
    </a>
  );
}
