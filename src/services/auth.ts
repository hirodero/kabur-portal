import { resolvePortalFetchUrl } from "@/lib/portal-api-client";
import { portalApiRoutes } from "@/lib/portal-api-config";

/** Current user from `GET …/auth/me` (backend shape). */
export interface PortalUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  active?: boolean;
  role: string;
  "created-at"?: string;
  "last-login-at"?: string;
  "last-active-at"?: string;
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

export class AuthServiceError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthServiceError";
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
    method === "POST";

  return fetch(resolvePortalFetchUrl(path), {
    ...init,
    credentials: "include",
    headers: mergeHeaders(init, hasJsonStringBody),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function throwIfErrorEnvelope(
  res: Response,
  envelope: PortalErrorEnvelope | PortalOkEnvelope<unknown> | PortalOkMessageEnvelope,
): void {
  if (envelope.status === "error") {
    throw new AuthServiceError(res.status, envelope.message);
  }
}

/**
 * `POST /portal-api/v1/auth/google/callback` — public; sets `portal-token` on success (same-origin + credentials).
 */
export async function postGoogleIdTokenCallback(
  idToken: string,
  init?: RequestInit,
): Promise<PortalUser> {
  const trimmed = idToken.trim();
  if (!trimmed) {
    throw new AuthServiceError(400, "id_token is required");
  }

  const res = await portalFetch(portalApiRoutes.authGoogleCallback, {
    method: "POST",
    ...init,
    body: JSON.stringify({ id_token: trimmed }),
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new AuthServiceError(
      res.status,
      res.statusText || "Invalid JSON response",
    );
  }

  if (!isRecord(body)) {
    throw new AuthServiceError(res.status, "Unexpected response shape");
  }

  throwIfErrorEnvelope(
    res,
    body as unknown as PortalErrorEnvelope | PortalOkEnvelope<{ user: PortalUser }>,
  );

  if (!res.ok) {
    const msg =
      "message" in body && typeof body.message === "string"
        ? body.message
        : res.statusText;
    throw new AuthServiceError(res.status, msg);
  }

  if (body.status !== "ok") {
    throw new AuthServiceError(res.status, "Unexpected response status");
  }

  const data = body as unknown as PortalOkEnvelope<{ user: PortalUser }>;
  if (!data.data?.user) {
    throw new AuthServiceError(res.status, "Missing user in response");
  }
  return data.data.user;
}

/**
 * `POST /portal-api/v1/auth/logout` — clears `portal-token` (per backend).
 */
export async function postLogout(init?: RequestInit): Promise<void> {
  const res = await portalFetch(portalApiRoutes.authLogout, {
    method: "POST",
    ...init,
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new AuthServiceError(
      res.status,
      res.statusText || "Invalid JSON response",
    );
  }

  if (!isRecord(body)) {
    throw new AuthServiceError(res.status, "Unexpected response shape");
  }

  throwIfErrorEnvelope(
    res,
    body as unknown as PortalErrorEnvelope | PortalOkMessageEnvelope,
  );

  if (!res.ok) {
    const msg =
      "message" in body && typeof body.message === "string"
        ? body.message
        : res.statusText;
    throw new AuthServiceError(res.status, msg);
  }

  if (body.status !== "ok") {
    throw new AuthServiceError(res.status, "Unexpected response status");
  }

}

/**
 * `GET /portal-api/v1/auth/me` — requires `portal-token`.
 */
export async function getAuthMe(init?: RequestInit): Promise<PortalUser> {
  const res = await portalFetch(portalApiRoutes.authMe, {
    method: "GET",
    ...init,
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new AuthServiceError(
      res.status,
      res.statusText || "Invalid JSON response",
    );
  }

  if (!isRecord(body)) {
    throw new AuthServiceError(res.status, "Unexpected response shape");
  }

  throwIfErrorEnvelope(
    res,
    body as unknown as PortalErrorEnvelope | PortalOkEnvelope<{ user: PortalUser }>,
  );

  if (!res.ok) {
    const msg =
      "message" in body && typeof body.message === "string"
        ? body.message
        : res.statusText;
    throw new AuthServiceError(res.status, msg);
  }

  if (body.status !== "ok") {
    throw new AuthServiceError(res.status, "Unexpected response status");
  }

  const data = body as unknown as PortalOkEnvelope<{ user: PortalUser }>;
  if (!data.data?.user) {
    throw new AuthServiceError(res.status, "Missing user in response");
  }
  return data.data.user;
}
