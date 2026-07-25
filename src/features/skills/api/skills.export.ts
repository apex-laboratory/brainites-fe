/**
 * `GET /skills/export` (admin-only) returns a raw `application/zip` bundle
 * rather than the `{ data, meta }` JSON envelope, so it goes through the
 * client's blob path instead of the typed one. Auth, timeout, the single
 * 401→refresh→retry and `ApiError` normalization are all the client's — the
 * only thing this module owns is the export's longer timeout and its filename
 * fallback.
 */

import { api } from "@/lib/api";

/** Fallback filename matching the backend's `Content-Disposition`. */
const DEFAULT_EXPORT_FILENAME = "company-brain-skills.zip";

/** Export can be large; allow longer than the default 15s request timeout. */
const EXPORT_TIMEOUT_MS = 60_000;

export interface SkillsExport {
  blob: Blob;
  filename: string;
}

/**
 * Download the full published-skills bundle as a zip Blob. The caller (a hook)
 * is responsible for turning it into a browser download. Admin-only: a
 * non-admin receives 403 → `ApiError("forbidden")`.
 */
export async function exportSkills(): Promise<SkillsExport> {
  const { blob, filename } = await api.blob("/skills/export", {
    timeoutMs: EXPORT_TIMEOUT_MS,
  });
  return { blob, filename: filename ?? DEFAULT_EXPORT_FILENAME };
}
