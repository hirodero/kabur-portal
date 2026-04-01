"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  InformationCircleIcon,
} from "hugeicons-react";
import { useSidebar } from "@/contexts/SidebarContext";

const NAV_ITEMS = [{ href: "/jobs", label: "Beranda", icon: Home01Icon }];

export function AppSidebar() {
  const { expanded, toggle } = useSidebar();
  const pathname = usePathname();

  const width = expanded ? "w-60" : "w-[72px]";

  return (
    <aside
      className={`hidden lg:flex fixed left-0 top-0 z-40 h-screen ${width} flex-col bg-white border-r border-ink/10 shadow-sm transition-all duration-300 ease-out`}
    >
      {/* Toggle button — floating on the right edge, vertically centered */}
      <button
        onClick={toggle}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded-full bg-white border border-ink/15 shadow-md flex items-center justify-center text-ink-muted hover:text-primary hover:border-primary/30 transition-colors"
      >
        {expanded ? (
          <ArrowLeft01Icon size={14} />
        ) : (
          <ArrowRight01Icon size={14} />
        )}
      </button>

      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-ink/10 shrink-0 px-4 ${expanded ? "" : "justify-center"}`}>
        <Link href="/jobs" className="flex items-center min-w-0">
          {expanded ? (
            <span className="font-jakarta font-bold text-lg text-ink tracking-tight whitespace-nowrap">
              #Kabur<span className="text-primary">Portal</span>
            </span>
          ) : (
            <span className="w-10 h-7 rounded-md flex items-center justify-center bg-primary text-white font-jakarta font-bold text-xs shrink-0">
              #KP
            </span>
          )}
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {expanded && (
          <p className="font-jakarta text-[11px] uppercase tracking-widest text-ink-muted px-3 mb-3">
            Menu
          </p>
        )}
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-jakarta text-sm transition-colors ${
                    isActive
                      ? "bg-ink/5 text-primary font-medium"
                      : "text-ink-muted hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  {expanded && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom actions - expanded only */}
        {expanded && (
          <div className="mt-6 pt-4 border-t border-ink/10 space-y-2">
            <Link
              href="/detail"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-jakarta text-sm transition-colors ${
                pathname === "/detail"
                  ? "bg-ink/5 text-primary font-medium"
                  : "text-ink-muted hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <InformationCircleIcon size={14} strokeWidth={1.75} />
              </span>
              <span>About Us</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-ink/10 shrink-0">
        <div
          className={`flex items-center gap-3 rounded-lg p-2.5 ${
            expanded ? "" : "justify-center"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-jakarta font-bold text-sm shrink-0">
            BS
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="font-jakarta font-medium text-sm text-ink truncate">
                Budi Santoso
              </p>
              <p className="font-jakarta text-[11px] text-ink-muted">
                PMI Terdaftar
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
