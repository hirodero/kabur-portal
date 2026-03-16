"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect } from "react";

interface LogoItem {
  src: string;
  alt: string;
}

export function InfiniteMovingLogos({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  items: LogoItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        scrollerRef.current?.appendChild(duplicatedItem);
      });

      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }

      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        pauseOnHover && "group",
        className
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex w-max shrink-0 flex-nowrap gap-6",
          "animate-scroll",
          pauseOnHover && "group-hover:paused"
        )}
      >
        {items.map((item, idx) => (
          <div
            key={`${item.alt}-${idx}`}
            className="relative flex size-16 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white p-2"
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={48}
              height={48}
              className="object-contain w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
