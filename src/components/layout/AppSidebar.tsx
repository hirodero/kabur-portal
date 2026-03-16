"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home01Icon,
  Search01Icon,
  Bookmark02Icon,
  CalendarAdd01Icon,
  Settings01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "hugeicons-react";
import { Button } from "@heroui/react";
import { useSidebar } from "@/contexts/SidebarContext";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: Home01Icon },
  { href: "/home", label: "Lowongan", icon: Search01Icon },
  { href: "/job-fair", label: "Job Fair", icon: CalendarAdd01Icon },
  { href: "/home?tab=saved", label: "Simpan", icon: Bookmark02Icon },
  { href: "#", label: "Pengaturan", icon: Settings01Icon },
];

export function AppSidebar() {
  const { expanded, toggle } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const width = expanded ? "w-60" : "w-[72px]";

  return (
    <aside
      className={`hidden lg:flex fixed left-0 top-0 z-40 h-screen ${width} flex-col bg-white border-r border-ink/10 shadow-sm transition-all duration-300 ease-out`}
    >
      {/* Logo + toggle */}
      <div
        className={`flex items-center h-16 border-b border-ink/10 shrink-0 ${
          expanded ? "justify-between px-4" : "flex-col justify-center gap-1 py-2"
        }`}
      >
        <Link
          href="/"
          className={`flex items-center min-w-0 ${expanded ? "gap-3" : "justify-center"}`}
        >
          {expanded ? (
            <span className="font-jakarta font-bold text-lg text-ink tracking-tight whitespace-nowrap">
              #Kabur<span className="text-primary">Portal</span>
            </span>
          ) : (
            <span className="w-10 h-8 rounded flex items-center justify-center bg-primary text-white font-jakarta font-bold text-xs shrink-0">
              #KP
            </span>
          )}
        </Link>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={toggle}
          className={`shrink-0 min-w-8 w-8 h-8 text-ink-muted hover:text-ink ${
            expanded ? "" : "self-center"
          }`}
        >
          {expanded ? (
            <ArrowLeft01Icon size={18} />
          ) : (
            <ArrowRight01Icon size={18} />
          )}
        </Button>
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
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-muted hover:bg-ink/5 hover:text-ink font-jakarta text-sm transition-colors text-left">
              <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-[10px] font-bold">?</span>
              </span>
              <span>Bantuan</span>
            </button>
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
