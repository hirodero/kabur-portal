"use client";

import { useEffect, useState } from "react";
import { Bookmark01Icon } from "hugeicons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isBookmarked, setBookmarkState } from "@/lib/storage";
import {
  addBookmark,
  isValidBookmarkJobId,
  listMyBookmarks,
  removeBookmark,
} from "@/services/bookmarks";

interface BookmarkButtonProps {
  localJobId: string;
  backendJobId?: string;
  className?: string;
}

let remoteBookmarksCache: Set<string> | null = null;
let remoteBookmarksPromise: Promise<Set<string>> | null = null;

async function getRemoteBookmarks(): Promise<Set<string>> {
  if (remoteBookmarksCache) return remoteBookmarksCache;
  if (!remoteBookmarksPromise) {
    remoteBookmarksPromise = listMyBookmarks()
      .then((rows) => new Set(rows.map((row) => row["job-id"]).filter(Boolean)))
      .catch(() => new Set<string>())
      .then((set) => {
        remoteBookmarksCache = set;
        return set;
      });
  }
  return remoteBookmarksPromise;
}

export function BookmarkButton({
  localJobId,
  backendJobId,
  className,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serverJobId =
    backendJobId && isValidBookmarkJobId(backendJobId) ? backendJobId : null;

  useEffect(() => {
    setBookmarked(isBookmarked(localJobId));
  }, [localJobId]);

  useEffect(() => {
    let cancelled = false;
    if (!serverJobId) return;

    getRemoteBookmarks().then((set) => {
      if (cancelled) return;
      const remoteState = set.has(serverJobId);
      setBookmarkState(localJobId, remoteState);
      setBookmarked(remoteState);
    });

    return () => {
      cancelled = true;
    };
  }, [localJobId, serverJobId]);

  async function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (isSubmitting) return;

    const next = !bookmarked;
    setBookmarkState(localJobId, next);
    setBookmarked(next);
    setIsSubmitting(true);

    try {
      if (serverJobId) {
        if (next) {
          await addBookmark(serverJobId);
          const cache = await getRemoteBookmarks();
          cache.add(serverJobId);
        } else {
          await removeBookmark(serverJobId);
          const cache = await getRemoteBookmarks();
          cache.delete(serverJobId);
        }
      }
      toast.success(next ? "Disimpan ke bookmark" : "Bookmark dihapus");
    } catch {
      // Keep local bookmark state for non-ObjectId records / temporary API issues.
      toast.message(
        "Bookmark lokal tersimpan, sinkronisasi server akan dicoba lagi nanti.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={bookmarked ? "Hapus bookmark" : "Simpan bookmark"}
      aria-pressed={bookmarked}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={handleToggle}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
        bookmarked
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-ink/15 bg-white text-ink-muted hover:text-primary hover:border-primary/30",
        className,
      )}
    >
      <Bookmark01Icon
        size={17}
        className={cn(bookmarked ? "fill-current" : "")}
      />
    </button>
  );
}
