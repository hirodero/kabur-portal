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

export function useFunderMode() {
  const [funderMode, setFunderModeState] = useState(false);
  const [qualifiedUsers, setQualifiedUsersState] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    initQualifiedUsers();
    setFunderModeState(getFunderMode());
    setQualifiedUsersState(getQualifiedUsers());
    setHydrated(true);
  }, []);

  const toggleFunderMode = useCallback(() => {
    setFunderModeState((prev) => {
      const next = !prev;
      setFunderMode(next);
      return next;
    });
  }, []);

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
    qualifiedUsers,
    confirmQualified,
    unconfirmQualified,
    getCount,
    hydrated,
  };
}
