import { resolvePortalFetchUrl } from "@/lib/portal-api-client";
import { portalApiRoutes } from "@/lib/portal-api-config";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface Bookmark {
  _id: string;
  "user-id": string;
  "job-id": string;
}

interface PortalOkEnvelope<T> {
  status: "ok";
  data: T;
}

interface PortalOkMessageEnvelope {
  status: "ok";
  message: string;
}

interface PortalErrorEnvelope {
  status: "error";
  message: string;
}

export class BookmarksServiceError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BookmarksServiceError";
    this.status = status;
  }
}

export function isValidBookmarkJobId(jobId: string): boolean {
  return UUID_REGEX.test(jobId);
}

function mergeHeaders(init?: RequestInit): Headers {
  const h = new Headers(init?.headers);
  if (!h.has("Accept")) h.set("Accept", "application/json");
  return h;
}

async function portalFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(resolvePortalFetchUrl(path), {
    ...init,
    credentials: "include",
    headers: mergeHeaders(init),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readPortalData<T>(res: Response): Promise<T> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new BookmarksServiceError(
      res.status,
      res.statusText || "Invalid JSON response",
    );
  }

  if (!isRecord(body)) {
    throw new BookmarksServiceError(res.status, "Unexpected response shape");
  }

  const envelope = body as unknown as
    | PortalOkEnvelope<T>
    | PortalErrorEnvelope;

  if (envelope.status === "error") {
    throw new BookmarksServiceError(res.status, envelope.message);
  }

  if (!res.ok) {
    const errMsg =
      "message" in body && typeof body.message === "string"
        ? body.message
        : res.statusText;
    throw new BookmarksServiceError(res.status, errMsg);
  }

  if (envelope.status !== "ok") {
    throw new BookmarksServiceError(res.status, "Unexpected response status");
  }

  return (envelope as PortalOkEnvelope<T>).data;
}

/**
 * `GET /portal-api/v1/me/bookmarks` — requires `portal-token`.
 */
export async function listMyBookmarks(init?: RequestInit): Promise<Bookmark[]> {
  const res = await portalFetch(portalApiRoutes.meBookmarks, {
    method: "GET",
    ...init,
  });
  const data = await readPortalData<{ bookmarks: Bookmark[] }>(res);
  return data.bookmarks ?? [];
}

/**
 * `POST /portal-api/v1/jobs/:jobId/bookmark` — idempotent 200; `jobId` must be Mongo ObjectId hex.
 */
export async function addBookmark(
  jobId: string,
  init?: RequestInit,
): Promise<Bookmark> {
  if (!isValidBookmarkJobId(jobId)) {
    throw new BookmarksServiceError(
      400,
      "jobId must be a valid 24-character MongoDB ObjectId hex string",
    );
  }

  const res = await portalFetch(portalApiRoutes.jobBookmark(jobId), {
    method: "POST",
    ...init,
  });

  const data = await readPortalData<{ bookmark: Bookmark }>(res);
  if (!data.bookmark) {
    throw new BookmarksServiceError(res.status, "Missing bookmark in response");
  }
  return data.bookmark;
}

/**
 * `DELETE /portal-api/v1/jobs/:jobId/bookmark` — idempotent; success `{ status: "ok", message: "bookmark removed" }`.
 */
export async function removeBookmark(
  jobId: string,
  init?: RequestInit,
): Promise<void> {
  if (!isValidBookmarkJobId(jobId)) {
    throw new BookmarksServiceError(
      400,
      "jobId must be a valid 24-character MongoDB ObjectId hex string",
    );
  }

  const res = await portalFetch(portalApiRoutes.jobBookmark(jobId), {
    method: "DELETE",
    ...init,
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new BookmarksServiceError(
      res.status,
      res.statusText || "Invalid JSON response",
    );
  }

  if (!isRecord(body)) {
    throw new BookmarksServiceError(res.status, "Unexpected response shape");
  }

  const envelope = body as unknown as
    | PortalErrorEnvelope
    | PortalOkMessageEnvelope;

  if (envelope.status === "error") {
    throw new BookmarksServiceError(res.status, envelope.message);
  }

  if (!res.ok) {
    const msg =
      "message" in body && typeof body.message === "string"
        ? body.message
        : res.statusText;
    throw new BookmarksServiceError(res.status, msg);
  }

  if (body.status !== "ok") {
    throw new BookmarksServiceError(res.status, "Unexpected response status");
  }

  const ok = body as unknown as PortalOkMessageEnvelope;
  if (
    typeof ok.message === "string" &&
    ok.message !== "bookmark removed"
  ) {
    throw new BookmarksServiceError(
      res.status,
      `Unexpected message: ${ok.message}`,
    );
  }
}
