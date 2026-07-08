/** Shared HTTP configuration for the API layer. */

/** Backend base URL including the `/api/v1` prefix. Trailing slash trimmed. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

/** Per-request timeout. Requests exceeding this abort as `ApiError("timeout")`. */
export const REQUEST_TIMEOUT_MS = 15_000;
