import { resolvePortalFetchUrl } from "@/lib/portal-api-client";
import { portalApiRoutes } from "@/lib/portal-api-config";

const MONGO_OBJECT_ID_HEX = /^[0-9a-f]{24}$/i;

export interface Application {
  _id: string;
  "user-id": string;
  "job-id": string;
}

interface PortalOkEnvelope<T> {
  status: "ok";
  data: T;
}

interface PortalErrorEnvelope {
  status: "error";
  message: string;
}

export class ApplicationsServiceError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApplicationsServiceError";
    this.status = status;
  }
}

export function isValidJobApplicationObjectId(jobId: string): boolean {
  return MONGO_OBJECT_ID_HEX.test(jobId);
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

async function readPortalData<T>(res: Response): Promise<T> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ApplicationsServiceError(
      res.status,
      res.statusText || "Invalid JSON response",
    );
  }

  if (typeof body !== "object" || body === null) {
    throw new ApplicationsServiceError(res.status, "Unexpected response shape");
  }

  const envelope = body as PortalOkEnvelope<T> | PortalErrorEnvelope;

  if (envelope.status === "error") {
    throw new ApplicationsServiceError(res.status, envelope.message);
  }

  if (!res.ok) {
    const errMsg =
      "message" in envelope && typeof envelope.message === "string"
        ? envelope.message
        : res.statusText;
    throw new ApplicationsServiceError(res.status, errMsg);
  }

  if (envelope.status !== "ok") {
    throw new ApplicationsServiceError(res.status, "Unexpected response status");
  }

  return envelope.data;
}

/**
 * `GET /portal-api/v1/me/applications` — requires `portal-token` (same-origin + credentials).
 */
export async function listMyApplications(
  init?: RequestInit,
): Promise<Application[]> {
  const res = await portalFetch(portalApiRoutes.meApplications, {
    method: "GET",
    ...init,
    headers: mergeHeaders(init),
  });
  const data = await readPortalData<{ applications: Application[] }>(res);
  return data.applications ?? [];
}

/**
 * `POST /portal-api/v1/jobs/:jobId/applications` — idempotent 200; body not required.
 * `jobId` must be a 24-char MongoDB ObjectId hex string.
 */
export async function applyToJob(
  jobId: string,
  init?: RequestInit,
): Promise<Application> {
  if (!isValidJobApplicationObjectId(jobId)) {
    throw new ApplicationsServiceError(
      400,
      "jobId must be a valid 24-character MongoDB ObjectId hex string",
    );
  }

  const res = await portalFetch(portalApiRoutes.jobApplications(jobId), {
    method: "POST",
    ...init,
    headers: mergeHeaders(init),
  });

  const data = await readPortalData<{ application: Application }>(res);
  if (!data.application) {
    throw new ApplicationsServiceError(res.status, "Missing application in response");
  }
  return data.application;
}
