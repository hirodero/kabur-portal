import { resolvePortalFetchUrl } from "@/lib/portal-api-client";
import { portalApiRoutes } from "@/lib/portal-api-config";

/** Profile document (kebab-case + merged `role`; extend as fields stabilize). */
export interface Profile {
  _id: string;
  "user-id": string;
  role?: string;
  initials?: string;
  location?: string;
  "mp-referral"?: string;
  skills?: Record<string, number>;
}

/** Allowed keys for `PATCH …/me/profile` (others ignored by backend). */
export interface ProfilePatch {
  initials?: string;
  location?: string;
  "mp-referral"?: string;
}

interface PortalOkEnvelope<T> {
  status: "ok";
  data: T;
}

interface PortalErrorEnvelope {
  status: "error";
  message: string;
}

export class ProfileServiceError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ProfileServiceError";
    this.status = status;
  }
}

function mergeHeaders(init?: RequestInit, jsonBody?: boolean): Headers {
  const h = new Headers(init?.headers);
  if (!h.has("Accept")) h.set("Accept", "application/json");
  if (jsonBody && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  return h;
}

async function portalFetch(path: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const hasJsonStringBody =
    typeof init?.body === "string" &&
    (method === "POST" || method === "PUT" || method === "PATCH");

  return fetch(resolvePortalFetchUrl(path), {
    ...init,
    credentials: "include",
    headers: mergeHeaders(init, hasJsonStringBody),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && !Array.isArray(value);
}

async function readPortalData<T>(res: Response): Promise<T> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ProfileServiceError(
      res.status,
      res.statusText || "Invalid JSON response",
    );
  }

  if (!isRecord(body)) {
    throw new ProfileServiceError(res.status, "Unexpected response shape");
  }

  const envelope = body as unknown as PortalOkEnvelope<T> | PortalErrorEnvelope;

  if (envelope.status === "error") {
    throw new ProfileServiceError(res.status, envelope.message);
  }

  if (!res.ok) {
    const errMsg =
      "message" in body && typeof body.message === "string"
        ? body.message
        : res.statusText;
    throw new ProfileServiceError(res.status, errMsg);
  }

  if (envelope.status !== "ok") {
    throw new ProfileServiceError(res.status, "Unexpected response status");
  }

  return (envelope as PortalOkEnvelope<T>).data;
}

function buildPatchBody(patch: ProfilePatch): Record<string, string> {
  const body: Record<string, string> = {};
  if (patch.initials !== undefined) body.initials = patch.initials;
  if (patch.location !== undefined) body.location = patch.location;
  if (patch["mp-referral"] !== undefined) {
    body["mp-referral"] = patch["mp-referral"];
  }
  return body;
}

/**
 * `GET /portal-api/v1/me/profile` — requires `portal-token`.
 */
export async function getProfile(init?: RequestInit): Promise<Profile> {
  const res = await portalFetch(portalApiRoutes.meProfile, {
    method: "GET",
    ...init,
  });
  const data = await readPortalData<{ profile: Profile }>(res);
  if (!data.profile) {
    throw new ProfileServiceError(res.status, "Missing profile in response");
  }
  return data.profile;
}

/**
 * `PATCH /portal-api/v1/me/profile` — only `initials`, `location`, `mp-referral` sent when present.
 */
export async function patchProfile(
  patch: ProfilePatch,
  init?: RequestInit,
): Promise<Profile> {
  const body = buildPatchBody(patch);
  const res = await portalFetch(portalApiRoutes.meProfile, {
    method: "PATCH",
    ...init,
    body: JSON.stringify(body),
  });
  const data = await readPortalData<{ profile: Profile }>(res);
  if (!data.profile) {
    throw new ProfileServiceError(res.status, "Missing profile in response");
  }
  return data.profile;
}

/**
 * `PUT /portal-api/v1/me/skills` — replaces entire `skills` on the profile.
 */
export async function putProfileSkills(
  skills: Record<string, number>,
  init?: RequestInit,
): Promise<Profile> {
  if (!isPlainObject(skills)) {
    throw new ProfileServiceError(400, "skills must be a JSON object");
  }
  for (const v of Object.values(skills)) {
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new ProfileServiceError(
        400,
        "each skill value must be a finite number",
      );
    }
  }

  const res = await portalFetch(portalApiRoutes.meSkills, {
    method: "PUT",
    ...init,
    body: JSON.stringify({ skills }),
  });

  const data = await readPortalData<{ profile: Profile }>(res);
  if (!data.profile) {
    throw new ProfileServiceError(res.status, "Missing profile in response");
  }
  return data.profile;
}
