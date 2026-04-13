import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTopDomain(url: string): string {
  const hostname = new URL(url).hostname
  const parts = hostname.split(".")
  return parts.slice(-2).join(".")
}
