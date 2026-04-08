"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFunderMode,
  setFunderMode,
  getQualifiedUsers,
  addQualifiedUser,
  removeQualifiedUser,
  initQualifiedUsers,
} from "@/lib/storage";

const FUNDER_DEBUG_ENABLED = process.env.NEXT_PUBLIC_FUNDER_MODE_DEBUG === "true";

interface UseFunderModeOptions {
  role?: "candidate" | "funder" | "admin";
}

export function useFunderMode({ role = "candidate" }: UseFunderModeOptions = {}) {
  const [funderMode, setFunderModeState] = useState(false);
  const [qualifiedUsers, setQualifiedUsersState] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const isRoleAllowed = role === "funder" || role === "admin";
  const canUseFunderMode = FUNDER_DEBUG_ENABLED || isRoleAllowed;
  const isToggleVisible = canUseFunderMode && !FUNDER_DEBUG_ENABLED;

  useEffect(() => {
    initQualifiedUsers();
    if (FUNDER_DEBUG_ENABLED && canUseFunderMode) {
      setFunderMode(true);
      setFunderModeState(true);
    } else {
      const storedMode = getFunderMode();
      setFunderModeState(canUseFunderMode ? storedMode : false);
    }
    setQualifiedUsersState(getQualifiedUsers());
    setHydrated(true);
  }, [canUseFunderMode]);

  const toggleFunderMode = useCallback(() => {
    if (!canUseFunderMode || FUNDER_DEBUG_ENABLED) return;
    setFunderModeState((prev) => {
      const next = !prev;
      setFunderMode(next);
      return next;
    });
  }, [canUseFunderMode]);

  const confirmQualified = useCallback((jobId: string) => {
    const newCount = addQualifiedUser(jobId);
    setQualifiedUsersState((prev) => ({ ...prev, [jobId]: newCount }));
    return newCount;
  }, []);

  const unconfirmQualified = useCallback((jobId: string) => {
    const newCount = removeQualifiedUser(jobId);
    setQualifiedUsersState((prev) => ({ ...prev, [jobId]: newCount }));
    return newCount;
  }, []);

  const getCount = useCallback(
    (jobId: string) => qualifiedUsers[jobId] ?? 0,
    [qualifiedUsers]
  );

  return {
    funderMode,
    toggleFunderMode,
    canUseFunderMode,
    isToggleVisible,
    isRoleAllowed,
    debugEnabled: FUNDER_DEBUG_ENABLED,
    qualifiedUsers,
    confirmQualified,
    unconfirmQualified,
    getCount,
    hydrated,
  };
}
