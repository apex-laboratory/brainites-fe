/**
 * `GET /skills/export` (admin-only) returns a raw `application/zip` bundle, not
 * the `{ data, meta }` JSON envelope — so it can't go through the typed `api`
 * client. This is the one skills call that touches a raw `Response`: it fetches
 * the blob with the same `Authorization` header and single 401→refresh→retry
 * behaviour, and reads the download filename off `Content-Disposition`.
 */

import { API_BASE_URL } from "@/lib/api/config";
import { ApiError, getAccessToken, refreshTokens } from "@/lib/api";

/** Fallback filename matching the backend's `Content-Disposition`. */
const DEFAULT_EXPORT_FILENAME = "company-brain-skills.zip";

export interface SkillsExport {
  blob: Blob;
  filename: string;
}

function filenameFromDisposition(header: string | null): string {
  if (!header) return DEFAULT_EXPORT_FILENAME;
  const match = /filename="?([^"]+)"?/.exec(header);
  return match?.[1] ?? DEFAULT_EXPORT_FILENAME;
}

/** Export can be large; allow longer than the default 15s request timeout. */
const EXPORT_TIMEOUT_MS = 60_000;

async function fetchExport(): Promise<Response> {
  const token = getAccessToken();
  return fetch(`${API_BASE_URL}/skills/export`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    signal: AbortSignal.timeout(EXPORT_TIMEOUT_MS),
  });
}

/**
 * Download the full published-skills bundle as a zip Blob. The caller (a hook)
 * is responsible for turning it into a browser download. Admin-only: a
 * non-admin receives 403 → `ApiError("forbidden")`.
 */
export async function exportSkills(): Promise<SkillsExport> {
  let res: Response;
  try {
    res = await fetchExport();
    if (res.status === 401) {
      await refreshTokens(); // single-flight; throws + signals on failure
      res = await fetchExport();
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("network_error", "Could not reach the server", null);
  }

  if (!res.ok) {
    throw new ApiError(
      ApiError.codeForStatus(res.status),
      res.statusText || "Export failed",
      res.status,
      undefined,
      res.headers.get("x-request-id") ?? undefined,
    );
  }

  return {
    blob: await res.blob(),
    filename: filenameFromDisposition(res.headers.get("content-disposition")),
  };
}
