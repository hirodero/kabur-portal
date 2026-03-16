"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addApplication, hasApplied } from "@/lib/storage";
import type { Job } from "@/types";

interface ApplyButtonProps {
  job: Job;
  className?: string;
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
}

const OFF_TAKER_MESSAGES: Record<string, string> = {
  APJATI: "Tim APJATI akan menghubungi kamu dalam 3–5 hari kerja.",
  KP2MI: "Tim KP2MI akan memverifikasi lamaranmu segera.",
};

export function ApplyButton({
  job,
  className = "",
  size = "default",
  fullWidth = false,
}: ApplyButtonProps) {
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setApplied(hasApplied(job.id));
  }, [job.id]);

  function handleApply() {
    if (applied) return;
    addApplication(job.id);
    setApplied(true);
    const message = OFF_TAKER_MESSAGES[job.offTaker] ?? "Lamaran berhasil dikirim!";
    toast.success("Lamaran berhasil dikirim!", {
      description: message,
      duration: 5000,
    });
  }

  return (
    <Button
      size={size}
      onClick={handleApply}
      isDisabled={applied}
      fullWidth={fullWidth}
      color="primary"
      variant="default"
      className={className}
    >
      {applied ? "Sudah Dilamar" : "Apply Sekarang"}
    </Button>
  );
}
