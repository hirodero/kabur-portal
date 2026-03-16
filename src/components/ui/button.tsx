"use client";

import { Button as HeroUIButton, ButtonProps as HeroUIButtonProps } from "@heroui/react";
import { cn } from "@/lib/utils";

/**
 * HeroUI Button wrapper - applies HeroUI UI/UX to all buttons.
 * Maps common variants to HeroUI equivalents.
 */
export interface ButtonProps extends Omit<HeroUIButtonProps, "color" | "variant" | "size"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "xs" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
}

const variantMap = {
  default: { color: "primary" as const, variant: "solid" as const },
  destructive: { color: "danger" as const, variant: "solid" as const },
  outline: { color: "default" as const, variant: "bordered" as const },
  secondary: { color: "default" as const, variant: "flat" as const },
  ghost: { color: "default" as const, variant: "light" as const },
  link: { color: "primary" as const, variant: "light" as const },
};

const sizeMap: Record<string, "sm" | "md" | "lg"> = {
  default: "md",
  sm: "sm",
  lg: "lg",
  xs: "sm",
  icon: "md",
  "icon-xs": "sm",
  "icon-sm": "sm",
  "icon-lg": "lg",
};

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const mapped = variantMap[variant] ?? variantMap.default;
  const color = mapped.color;
  const heroVariant = mapped.variant;
  const heroSize = sizeMap[size as string] ?? "md";

  return (
    <HeroUIButton
      className={cn("font-jakarta", className)}
      color={color}
      variant={heroVariant}
      size={heroSize}
      radius="md"
      {...props}
    />
  );
}

// Re-export buttonVariants for components that use it (e.g. for className composition)
export const buttonVariants = () => "";

export { Button };
