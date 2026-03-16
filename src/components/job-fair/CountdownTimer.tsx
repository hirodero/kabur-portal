"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units: { label: string; value: number }[] = [
    { label: "Hari", value: timeLeft.days },
    { label: "Jam", value: timeLeft.hours },
    { label: "Menit", value: timeLeft.minutes },
    { label: "Detik", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {units.map((unit, idx) => (
        <div key={unit.label} className="flex items-center gap-3 sm:gap-5">
          <div className="text-center">
            <div className="font-jakarta text-3xl sm:text-4xl font-bold text-white tabular-nums leading-none">
              {pad(unit.value)}
            </div>
            <div className="font-jakarta text-xs text-white/50 mt-1">{unit.label}</div>
          </div>
          {idx < units.length - 1 && (
            <span className="font-jakarta text-2xl font-bold text-white/30 mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
