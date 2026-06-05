/** Pure date helpers. The static fixtures use pre-formatted relative
 * strings (e.g. "2d ago", "6h"), so these helpers stay intentionally
 * light for now and can grow when real timestamps are introduced. */

/** Normalize a short relative token ("12m", "6h", "2d") to a label. */
export function normalizeRelative(token: string) {
  if (/ago$/i.test(token)) return token;
  if (/^\d+\s*[smhdw]$/i.test(token.trim())) return `${token} ago`;
  return token;
}
