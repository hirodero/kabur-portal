import { resolvePortalFetchUrl } from "@/lib/portal-api-client";
import { portalApiRoutes } from "@/lib/portal-api-config";

/** Marketing partner document (extend at call sites as fields stabilize). */
export interface MarketingPartner {
  _id?: string;
  name?: string;
}

/** Offtaker document (extend at call sites as fields stabilize). */
export interface Offtaker {
  _id?: string;
  name?: string;
}

interface PortalOkEnvelope<T> {
  status: "ok";
  data: T;
}

interface PortalErrorEnvelope {
  status: "error";
  message: string;
}

export class PartnersServiceError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PartnersServiceError";
    this.status = status;
  }
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
    throw new PartnersServiceError(
      res.status,
      res.statusText || "Invalid JSON response",
    );
  }

  if (!isRecord(body)) {
    throw new PartnersServiceError(res.status, "Unexpected response shape");
  }

  const envelope = body as unknown as PortalOkEnvelope<T> | PortalErrorEnvelope;

  if (envelope.status === "error") {
    throw new PartnersServiceError(res.status, envelope.message);
  }

  if (!res.ok) {
    const errMsg =
      "message" in body && typeof body.message === "string"
        ? body.message
        : res.statusText;
    throw new PartnersServiceError(res.status, errMsg);
  }

  if (envelope.status !== "ok") {
    throw new PartnersServiceError(res.status, "Unexpected response status");
  }

  return (envelope as PortalOkEnvelope<T>).data;
}

/**
 * `GET /portal-api/v1/marketing-partners` — public; reference data for marketing UI.
 */
export async function listMarketingPartners(
  init?: RequestInit,
): Promise<MarketingPartner[]> {
  const res = await portalFetch(portalApiRoutes.marketingPartners, {
    method: "GET",
    ...init,
  });
  const data = await readPortalData<{ partners: MarketingPartner[] }>(res);
  return data.partners ?? [];
}

/**
 * `GET /portal-api/v1/offtakers` — public; reference data for marketing UI / filters.
 */
export async function listOfftakers(init?: RequestInit): Promise<Offtaker[]> {
  const res = await portalFetch(portalApiRoutes.offtakers, {
    method: "GET",
    ...init,
  });
  const data = await readPortalData<{ offtakers: Offtaker[] }>(res);
  return data.offtakers ?? [];
}
