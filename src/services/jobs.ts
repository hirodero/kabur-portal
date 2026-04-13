import { portalApiPath } from "@/lib/portal-api-client";
import { portalApiRoutes } from "@/lib/portal-api-config";

/** Query for `GET /portal-api/v1/jobs` — all optional. */
export interface JobsListQuery {
  search?: string;
  countries?: string | string[];
  sectors?: string | string[];
  fundedOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

/** Job document (kebab-case keys as in Mongo / API). Extend at call sites as needed. */
export interface Job {
  _id?: string;
  "job-id"?: string;
  title?: string;
  company?: string;
  description?: string;
  "posted-at"?: string;
  country?: string;
  sector?: string;
}

export interface JobsListResult {
  jobs: Job[];
  "total-count": number;
  page: number;
  "page-size": number;
}

export interface MetadataFilters {
  countries: string[];
  sectors: string[];
}

interface PortalOkEnvelope<T> {
  status: "ok";
  data: T;
}

interface PortalErrorEnvelope {
  status: "error";
  message: string;
}

export class JobsServiceError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "JobsServiceError";
    this.status = status;
  }
}

function mergeHeaders(init?: RequestInit): Headers {
  const h = new Headers(init?.headers);
  if (!h.has("Accept")) h.set("Accept", "application/json");
  return h;
}

async function portalFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(portalApiPath(path), {
    ...init,
    credentials: "include",
    headers: mergeHeaders(init),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function appendMulti(
  params: URLSearchParams,
  key: string,
  value: string | string[] | undefined,
): void {
  if (value === undefined) return;
  if (Array.isArray(value)) {
    for (const v of value) {
      if (v !== "") params.append(key, v);
    }
    return;
  }
  if (value !== "") params.set(key, value);
}

export function buildJobsListSearchParams(query?: JobsListQuery): URLSearchParams {
  const sp = new URLSearchParams();
  if (!query) return sp;

  if (query.search !== undefined && query.search !== "") {
    sp.set("search", query.search);
  }
  appendMulti(sp, "countries", query.countries);
  appendMulti(sp, "sectors", query.sectors);
  if (query.fundedOnly === true) {
    sp.set("fundedOnly", "true");
  }
  if (query.page !== undefined) {
    sp.set("page", String(query.page));
  }
  if (query.pageSize !== undefined) {
    sp.set("pageSize", String(query.pageSize));
  }
  if (query.sortBy !== undefined && query.sortBy !== "") {
    sp.set("sortBy", query.sortBy);
  }
  return sp;
}

async function readPortalData<T>(res: Response): Promise<T> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new JobsServiceError(
      res.status,
      res.statusText || "Invalid JSON response",
    );
  }

  if (!isRecord(body)) {
    throw new JobsServiceError(res.status, "Unexpected response shape");
  }

  const envelope = body as unknown as PortalOkEnvelope<T> | PortalErrorEnvelope;

  if (envelope.status === "error") {
    throw new JobsServiceError(res.status, envelope.message);
  }

  if (!res.ok) {
    const errMsg =
      "message" in body && typeof body.message === "string"
        ? body.message
        : res.statusText;
    throw new JobsServiceError(res.status, errMsg);
  }

  if (envelope.status !== "ok") {
    throw new JobsServiceError(res.status, "Unexpected response status");
  }

  return (envelope as PortalOkEnvelope<T>).data;
}

/**
 * `GET /portal-api/v1/jobs` — public; optional filters via `URLSearchParams`.
 */
export async function listJobs(
  query?: JobsListQuery,
  init?: RequestInit,
): Promise<JobsListResult> {
  const sp = buildJobsListSearchParams(query);
  const qs = sp.toString();
  const path = qs ? `${portalApiRoutes.jobs}?${qs}` : portalApiRoutes.jobs;

  const res = await portalFetch(path, {
    method: "GET",
    ...init,
  });

  const data = await readPortalData<JobsListResult>(res);
  return {
    jobs: data.jobs ?? [],
    "total-count": data["total-count"] ?? 0,
    page: data.page ?? 1,
    "page-size": data["page-size"] ?? 10,
  };
}

/**
 * `GET /portal-api/v1/jobs/:jobId` — `jobId` may be logical `job-id` or Mongo `_id` hex.
 */
export async function getJob(
  jobId: string,
  init?: RequestInit,
): Promise<Job> {
  const id = jobId.trim();
  if (!id) {
    throw new JobsServiceError(400, "jobId is required");
  }

  const res = await portalFetch(portalApiRoutes.job(id), {
    method: "GET",
    ...init,
  });

  const data = await readPortalData<{ job: Job }>(res);
  if (!data.job) {
    throw new JobsServiceError(res.status, "Missing job in response");
  }
  return data.job;
}

/**
 * `GET /portal-api/v1/jobs/:jobId/similar` — same sector, max 4, excludes this job.
 */
export async function getSimilarJobs(
  jobId: string,
  init?: RequestInit,
): Promise<Job[]> {
  const id = jobId.trim();
  if (!id) {
    throw new JobsServiceError(400, "jobId is required");
  }

  const res = await portalFetch(portalApiRoutes.jobSimilar(id), {
    method: "GET",
    ...init,
  });

  const data = await readPortalData<{ jobs: Job[] }>(res);
  return data.jobs ?? [];
}

/**
 * `GET /portal-api/v1/metadata/filters` — distinct countries and sectors (sorted).
 */
export async function getMetadataFilters(
  init?: RequestInit,
): Promise<MetadataFilters> {
  const res = await portalFetch(portalApiRoutes.metadataFilters, {
    method: "GET",
    ...init,
  });

  const data = await readPortalData<MetadataFilters>(res);
  return {
    countries: data.countries ?? [],
    sectors: data.sectors ?? [],
  };
}
