"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home01Icon } from "hugeicons-react";

const NAV_ITEMS = [{ href: "/jobs", label: "Beranda", icon: Home01Icon }];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink/10 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-area-pb">
      <div className="flex items-center justify-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] py-2 ${
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
