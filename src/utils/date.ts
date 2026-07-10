/** Pure date helpers. Some static fixtures still carry pre-formatted relative
 * strings (e.g. "2d ago"); API payloads carry ISO timestamps. */

/** Normalize a short relative token ("12m", "6h", "2d") to a label. */
export function normalizeRelative(token: string) {
  if (/ago$/i.test(token)) return token;
  if (/^\d+\s*[smhdw]$/i.test(token.trim())) return `${token} ago`;
  return token;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Compact relative label for an ISO timestamp — "just now", "4m ago", "3h ago",
 * "2d ago" — falling back to an absolute date beyond 30 days. Returns `null`
 * for a missing timestamp so callers can render their own "never synced" copy.
 */
export function formatRelativeTime(
  iso: string | null | undefined,
  now: number = Date.now(),
): string | null {
  if (!iso) return null;

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const elapsed = now - then;
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < 30 * DAY) return `${Math.floor(elapsed / DAY)}d ago`;

  return new Date(then).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
