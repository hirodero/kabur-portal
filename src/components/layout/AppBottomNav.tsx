"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home01Icon,
  Search01Icon,
  Bookmark02Icon,
  CalendarAdd01Icon,
} from "hugeicons-react";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: Home01Icon },
  { href: "/home", label: "Lowongan", icon: Search01Icon },
  { href: "/job-fair", label: "Job Fair", icon: CalendarAdd01Icon },
  { href: "/home?tab=saved", label: "Simpan", icon: Bookmark02Icon },
];

export function AppBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink/10 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const [path] = item.href.split("?");
          const tab = item.href.includes("tab=")
            ? item.href.split("tab=")[1]?.split("&")[0]
            : null;
          let isActive: boolean;
          if (item.href === "/") {
            isActive = pathname === "/";
          } else if (path === "/home" && tab === "saved") {
            isActive =
              pathname.startsWith("/home") &&
              searchParams.get("tab") === "saved";
          } else if (path === "/home") {
            isActive =
              pathname.startsWith("/home") &&
              searchParams.get("tab") !== "saved";
          } else {
            isActive = pathname.startsWith(path);
          }
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-2 ${
                isActive ? "text-primary" : "text-ink-muted"
              }`}
            >
              <Icon size={22} className="shrink-0" />
              <span className="font-jakarta text-[10px] font-medium truncate max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
