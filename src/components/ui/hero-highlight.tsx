"use client";

import { cn } from "@/lib/utils";
import { useMotionValue, motion, useMotionTemplate } from "motion/react";
import React from "react";

/** Dot pattern colors - palette: parchment/cream for light, subtle for dark bg */
const DOT_PATTERNS = {
  light: {
    default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%23d4d4d4' cx='10' cy='10' r='2.5'/%3E%3C/svg%3E")`,
    hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%23C8102E' cx='10' cy='10' r='2.5'/%3E%3C/svg%3E")`,
  },
  dark: {
    default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%23ffffff' cx='10' cy='10' r='2.5' opacity='0.15'/%3E%3C/svg%3E")`,
    hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%23FEF3C7' cx='10' cy='10' r='2.5'/%3E%3C/svg%3E")`,
  },
};

export function HeroHighlight({
  children,
  className,
  containerClassName,
  variant = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  variant?: "light" | "dark";
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const patterns = DOT_PATTERNS[variant];
  const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.15), transparent 80%)`;

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    if (!currentTarget) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn("group relative", containerClassName)}
      onMouseMove={handleMouseMove}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ backgroundImage: patterns.default }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          backgroundImage: patterns.hover,
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      />
      <div className={cn("relative", className)}>{children}</div>
    </div>
  );
}

export function Highlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-block px-1.5 py-0.5 rounded-[4px]",
        "bg-[#FEF3C7] text-ink font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
}
