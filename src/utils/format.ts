/** Pure formatting helpers. No React, no side effects. */

/** Clamp a number between a min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Format a 0–100 confidence value as a percent string. */
export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

/**
 * Compact number formatting that mirrors the prototype's hand-written
 * counts (e.g. 2100 -> "2.1k"). Falls back to the raw value for strings.
 */
export function formatCompact(value: number | string) {
  if (typeof value === "string") return value;
  if (value < 1000) return String(value);
  const k = value / 1000;
  return `${k % 1 === 0 ? k : k.toFixed(1)}k`;
}
