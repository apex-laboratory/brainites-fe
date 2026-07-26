/**
 * The typed `fetch` wrapper — the ONLY place in the app that touches raw
 * `Response` objects or wraps network I/O in try/catch. Everything above it
 * deals in typed data (validated by zod) or `ApiError`.
 *
 * Responsibilities:
 *  - attach the `Authorization: Bearer` header (unless `skipAuth`)
 *  - map network failure / timeout / non-2xx into `ApiError`
 *  - on a 401, transparently refresh once (single-flight) and retry
 *  - unwrap the `{ data, meta }` success envelope
 *  - validate the payload against a zod schema at the boundary
 */

import type { z } from "zod";

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";
import { ApiError, type ApiErrorDetail } from "./errors";
import { getAccessToken, refreshTokens } from "./tokens";

/**
 * Any zod schema that *produces* `T`. The input type is deliberately left as
 * `unknown` rather than defaulting to `T`: schemas that transform or fall back
 * (`.transform()`, `.catch()`) accept an input that isn't `T`, and we always
 * feed these a raw parsed-JSON value anyway.
 */
export type ResponseSchema<T> = z.ZodType<T, z.ZodTypeDef, unknown>;

export interface ApiInit {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** JSON-serializable request body. Serialized with `JSON.stringify`. */
  body?: unknown;
  /** Query-string params; `undefined`/`null` values are dropped. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Skip the `Authorization` header (for `/auth/*` calls). */
  skipAuth?: boolean;
  /** Internal: prevents infinite refresh→retry recursion. */
  skipAuthRetry?: boolean;
  /** Per-request timeout override; defaults to `REQUEST_TIMEOUT_MS`. */
  timeoutMs?: number;
  signal?: AbortSignal;
}

/** The backend success envelope. `meta.requestId` aids server-side tracing. */
interface SuccessEnvelope<T> {
  data: T;
  meta?: { requestId?: string; timestamp?: string; [k: string]: unknown };
}

/** The backend error envelope (camelCase response bodies). */
interface ErrorEnvelope {
  error?: { code?: string; message?: string; details?: unknown };
  detail?: unknown; // FastAPI's default shape, tolerated until BE standardizes.
  meta?: { requestId?: string };
}

function buildUrl(path: string, params?: ApiInit["params"]): string {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/** Perform the fetch, normalizing transport-level failures into ApiError. */
async function doFetch(path: string, init: ApiInit): Promise<Response> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (!init.skipAuth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // Compose the caller's abort signal with a timeout signal.
  const timeout = AbortSignal.timeout(init.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const signal = init.signal
    ? anySignal([init.signal, timeout])
    : timeout;

  try {
    return await fetch(buildUrl(path, init.params), {
      method: init.method ?? "GET",
      headers,
      credentials: "include", // send/receive the auth refresh cookie
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal,
    });
  } catch (err) {
    // A timeout abort surfaces as an AbortError / TimeoutError.
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new ApiError("timeout", "The request timed out", null);
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("timeout", "The request was cancelled", null);
    }
    // A rejected fetch (DNS, CORS, offline) is a TypeError.
    throw new ApiError("network_error", "Could not reach the server", null);
  }
}

/** Parse a non-2xx response into a typed ApiError, tolerating malformed bodies. */
async function toApiError(res: Response): Promise<ApiError> {
  const code = ApiError.codeForStatus(res.status);
  const requestId = res.headers.get("x-request-id") ?? undefined;

  let body: ErrorEnvelope | null = null;
  try {
    body = (await res.json()) as ErrorEnvelope;
  } catch {
    // Non-JSON error (e.g. a proxy's 502 HTML page) — fall back to status text.
    return new ApiError(code, res.statusText || "Request failed", res.status, undefined, requestId);
  }

  // Preferred: our `{ error: { code, message, details } }` envelope.
  if (body?.error) {
    return new ApiError(
      normalizeCode(body.error.code, code),
      body.error.message || res.statusText || "Request failed",
      res.status,
      normalizeDetails(body.error.details),
      body.meta?.requestId ?? requestId,
    );
  }

  // Tolerate FastAPI's default shapes: `{ detail: "..." }` or
  // `{ detail: [{ loc, msg, type }] }` (422 validation).
  if (body?.detail !== undefined) {
    if (Array.isArray(body.detail)) {
      return new ApiError(
        code,
        "Validation failed",
        res.status,
        normalizeFastApiDetails(body.detail),
        requestId,
      );
    }
    return new ApiError(code, String(body.detail), res.status, undefined, requestId);
  }

  return new ApiError(code, res.statusText || "Request failed", res.status, undefined, requestId);
}

/** Trust the server's error code only if it's one we recognize. */
function normalizeCode(raw: string | undefined, fallback: ApiError["code"]): ApiError["code"] {
  const known: ApiError["code"][] = [
    "validation_error", "unauthorized", "forbidden", "not_found",
    "conflict", "rate_limited", "server_error", "network_error", "timeout",
    // Source-connector failures. `connector_authorization_failed` shares its
    // 502 with a plain bad gateway, so only the body's code distinguishes them.
    "not_configured", "connector_authorization_failed",
  ];
  return raw && (known as string[]).includes(raw) ? (raw as ApiError["code"]) : fallback;
}

function normalizeDetails(details: unknown): ApiErrorDetail[] | undefined {
  if (!Array.isArray(details)) return undefined;
  const out: ApiErrorDetail[] = [];
  for (const d of details) {
    if (d && typeof d === "object" && "path" in d && "message" in d) {
      out.push({ path: String(d.path), message: String(d.message) });
    }
  }
  return out.length ? out : undefined;
}

/** Flatten FastAPI's `[{ loc: [...], msg, type }]` into our detail shape. */
function normalizeFastApiDetails(details: unknown[]): ApiErrorDetail[] | undefined {
  const out: ApiErrorDetail[] = [];
  for (const d of details) {
    if (d && typeof d === "object" && "msg" in d) {
      const loc = "loc" in d && Array.isArray(d.loc) ? d.loc : [];
      // Drop the leading "body"/"query" segment for a clean field path.
      const path = loc.filter((s) => s !== "body" && s !== "query").join(".");
      out.push({ path: path || "root", message: String(d.msg) });
    }
  }
  return out.length ? out : undefined;
}

/**
 * Fetch, transparently refresh-and-retry once on a 401, and throw a typed
 * `ApiError` for any non-2xx. Everything response-shaped — the JSON envelope
 * path and the blob path — is built on top of this.
 */
async function fetchOk(path: string, init: ApiInit): Promise<Response> {
  const res = await doFetch(path, init);

  // Transparent single refresh + retry on an expired access token.
  if (res.status === 401 && !init.skipAuth && !init.skipAuthRetry) {
    await refreshTokens(); // single-flight; throws + signals on failure
    return fetchOk(path, { ...init, skipAuthRetry: true });
  }

  if (!res.ok) throw await toApiError(res);
  return res;
}

/** Read the download filename off `Content-Disposition`, if the server sent one. */
function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = /filename="?([^"]+)"?/.exec(header);
  return match?.[1] ?? null;
}

/**
 * The core request: fetch, refresh-on-401, unwrap the envelope, and validate
 * `data` against `schema`. Returns the validated payload **and** the raw
 * envelope `meta`, so callers that need pagination can read it. `schema` should
 * describe the **unwrapped** payload (the value of `data`).
 */
async function request<T>(
  path: string,
  schema: ResponseSchema<T>,
  init: ApiInit,
): Promise<{ data: T; meta: SuccessEnvelope<unknown>["meta"] }> {
  const res = await fetchOk(path, init);

  if (res.status === 204) return { data: schema.parse(undefined), meta: undefined };

  let body: SuccessEnvelope<unknown>;
  try {
    body = (await res.json()) as SuccessEnvelope<unknown>;
  } catch {
    throw new ApiError("server_error", "Malformed response body", res.status);
  }

  const result = schema.safeParse(body.data);
  if (!result.success) {
    // A schema mismatch means the BE drifted — make it loud and located.
    if (import.meta.env.DEV) {
      console.error(`[api] Response validation failed for ${path}`, result.error.flatten());
    }
    throw new ApiError(
      "server_error",
      `Unexpected response shape from ${path}`,
      res.status,
    );
  }
  return { data: result.data, meta: body.meta };
}

/**
 * Issue an API request and validate its response against `schema`.
 * `schema` should describe the **unwrapped** payload (the value of `data`).
 * Pass `z.void()`/`z.undefined()` for 204 responses.
 */
export async function api<T>(
  path: string,
  schema: ResponseSchema<T>,
  init: ApiInit = {},
): Promise<T> {
  const { data } = await request(path, schema, init);
  return data;
}

/** One page of a cursor-paginated list: the validated items plus the opaque
 * `nextCursor` from `meta` (`null` when there are no more pages). */
export interface Page<T> {
  items: T;
  nextCursor: string | null;
}

/**
 * Like `api`, but also surfaces the envelope's `meta.nextCursor` for
 * cursor-paginated list endpoints (`GET /skills`, `GET /decisions`). The cursor
 * is opaque — pass it back verbatim as the next request's `cursor` param.
 */
export async function apiPage<T>(
  path: string,
  schema: ResponseSchema<T>,
  init: ApiInit = {},
): Promise<Page<T>> {
  const { data, meta } = await request(path, schema, init);
  const raw = meta?.nextCursor;
  return { items: data, nextCursor: typeof raw === "string" ? raw : null };
}

// Convenience verbs. `body`/`params` are threaded through `ApiInit`.
api.get = <T>(path: string, schema: ResponseSchema<T>, init?: Omit<ApiInit, "method" | "body">) =>
  api(path, schema, { ...init, method: "GET" });

/** GET a cursor-paginated list, returning `{ items, nextCursor }`. */
api.getPage = <T>(path: string, schema: ResponseSchema<T>, init?: Omit<ApiInit, "method" | "body">) =>
  apiPage(path, schema, { ...init, method: "GET" });

api.post = <T>(path: string, schema: ResponseSchema<T>, body?: unknown, init?: Omit<ApiInit, "method">) =>
  api(path, schema, { ...init, method: "POST", body });

api.patch = <T>(path: string, schema: ResponseSchema<T>, body?: unknown, init?: Omit<ApiInit, "method">) =>
  api(path, schema, { ...init, method: "PATCH", body });

api.delete = <T>(path: string, schema: ResponseSchema<T>, init?: Omit<ApiInit, "method" | "body">) =>
  api(path, schema, { ...init, method: "DELETE" });

/** A downloaded file: the bytes plus the server-supplied name, if any. */
export interface BlobResponse {
  blob: Blob;
  /** From `Content-Disposition`; `null` when the server didn't name the file. */
  filename: string | null;
}

/**
 * GET a non-JSON response (a zip export, a CSV, an avatar) through the same
 * auth header, timeout, 401→refresh→retry and `ApiError` normalization as every
 * other call. The `{ data, meta }` envelope and zod validation simply don't
 * apply here — the body comes back as a `Blob`.
 */
api.blob = async (
  path: string,
  init: Omit<ApiInit, "method" | "body"> = {},
): Promise<BlobResponse> => {
  const res = await fetchOk(path, { ...init, method: "GET" });
  return {
    blob: await res.blob(),
    filename: filenameFromDisposition(res.headers.get("content-disposition")),
  };
};

/** Combine multiple AbortSignals into one that aborts when any input does. */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      signal: controller.signal,
    });
  }
  return controller.signal;
}
