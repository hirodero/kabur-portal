import { Search01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

interface JobsSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  /** Called when the search button is pressed (optional; listing may already filter live). */
  onSearchClick?: () => void;
}

export function JobsSearchBar({
  value,
  onValueChange,
  placeholder = "Cari lowongan, negara, sektor...",
  className,
  inputClassName,
  onSearchClick,
}: JobsSearchBarProps) {
  return (
    <div
      className={cn(
        "flex flex-1 min-w-0 max-w-md rounded-lg border border-ink/10 bg-white overflow-hidden transition-[border-color,box-shadow]",
        "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
        className
      )}
    >
      <input
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent px-4 py-2 font-jakarta text-sm text-ink placeholder:text-ink-faint",
          "focus:outline-none focus:ring-0",
          inputClassName
        )}
      />
      <button
        type="button"
        aria-label="Cari"
        onClick={onSearchClick}
        className="shrink-0 flex items-center justify-center bg-primary px-3.5 py-2 text-white transition-colors hover:bg-primary-dark"
      >
        <Search01Icon size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
}
