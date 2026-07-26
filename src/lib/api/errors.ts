/**
 * The single error type every layer above the HTTP client deals in. The client
 * is the only place that converts a raw `Response` / network failure into an
 * `ApiError`; components and hooks never see a bare `Response`.
 */

export type ApiErrorCode =
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "server_error"
  | "network_error"
  | "timeout"
  /** `501` — this deployment has no credentials for the provider. Retrying can
   * never help; the surface should say "Not available", not offer a retry. */
  | "not_configured"
  /** `502` from a source OAuth start — the provider refused authorization. The
   * server message explains why, so it's shown verbatim. */
  | "connector_authorization_failed";

/** A single field-level validation detail, normalized from the backend. */
export interface ApiErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    /** HTTP status, or `null` when the request never reached the server. */
    public readonly status: number | null,
    public readonly details?: ApiErrorDetail[],
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    // Restore the prototype chain when compiling to ES5 targets.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** Whether a retry could plausibly succeed (transient failures only). */
  get isRetryable(): boolean {
    // Both arrive on 5xx statuses but describe a settled configuration or
    // provider decision — retrying just repeats the same answer.
    if (
      this.code === "not_configured" ||
      this.code === "connector_authorization_failed"
    ) {
      return false;
    }
    return (
      this.code === "network_error" ||
      this.code === "timeout" ||
      this.status === 500 ||
      this.status === 502 ||
      this.status === 503 ||
      this.status === 504
    );
  }

  /** Map an HTTP status to our error taxonomy. */
  static codeForStatus(status: number): ApiErrorCode {
    switch (status) {
      case 400:
      case 422:
        return "validation_error";
      case 401:
        return "unauthorized";
      case 403:
        return "forbidden";
      case 404:
        return "not_found";
      case 409:
        return "conflict";
      case 429:
        return "rate_limited";
      case 501:
        return "not_configured";
      default:
        return status >= 500 ? "server_error" : "validation_error";
    }
  }
}

/** Narrowing helper so callers can `if (isApiError(err))` without `instanceof`. */
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
