"use client";

import * as React from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

interface PaginationProps extends React.ComponentProps<"nav"> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Compact mode: icon-only prev/next, no text (for narrow containers) */
  compact?: boolean;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [];
  const showLeftEllipsis = currentPage > 3;
  const showRightEllipsis = currentPage < totalPages - 2;

  if (!showLeftEllipsis) {
    for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i);
    if (showRightEllipsis) pages.push("ellipsis");
    if (totalPages > 5) pages.push(totalPages);
  } else if (!showRightEllipsis) {
    pages.push(1);
    if (showLeftEllipsis) pages.push("ellipsis");
    for (let i = Math.max(1, totalPages - 4); i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("ellipsis");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
    pages.push("ellipsis");
    pages.push(totalPages);
  }
  return pages;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  compact = false,
  className,
  ...props
}: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex justify-center min-w-0 overflow-hidden", className)}
      {...props}
    >
      <ul className="flex flex-row flex-wrap items-center justify-center gap-1">
        <li>
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Halaman sebelumnya"
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm font-medium transition-colors shrink-0",
              compact ? "px-2" : "px-3 py-2",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            <ArrowLeft01Icon size={16} />
            {!compact && <span className="hidden sm:inline">Sebelumnya</span>}
          </button>
        </li>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <li key={`ellipsis-${i}`}>
              <span className={cn("flex items-center justify-center text-muted-foreground", compact ? "size-7" : "size-9")}>
                …
              </span>
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? "page" : undefined}
                aria-label={`Halaman ${p}`}
                className={cn(
                  "inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors shrink-0",
                  compact ? "size-7" : "size-9",
                  p === currentPage
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
              >
                {p}
              </button>
            </li>
          )
        )}
        <li>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Halaman selanjutnya"
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm font-medium transition-colors shrink-0",
              compact ? "px-2" : "px-3 py-2",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {!compact && <span className="hidden sm:inline">Selanjutnya</span>}
            <ArrowRight01Icon size={16} />
          </button>
        </li>
      </ul>
    </nav>
  );
}

export { Pagination };
