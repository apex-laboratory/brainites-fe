/**
 * How loudly the dashboard should nag about the review queue.
 *
 * Nothing reaches the skill registry without a human approval any more — not a
 * high-confidence extraction, not one from the CEO's Slack. That makes an
 * unattended queue a silent outage: the knowledge base simply stops updating
 * and nothing says so. The count badge alone can't carry that, because a count
 * doesn't age. `oldestPendingAt` does, so it drives the escalation.
 */

const HOUR = 60 * 60 * 1000;

/** Oldest pending item older than this → a dismissible toast. */
export const QUEUE_WARN_MS = 24 * HOUR;
/** Oldest pending item older than this → a modal the admin must acknowledge. */
export const QUEUE_BLOCK_MS = 72 * HOUR;

/**
 * `none` still shows the count badge when `pending > 0` — the badge is passive
 * and always on, so it isn't a level of its own.
 */
export type QueueAlertLevel = "none" | "warn" | "block";

/** Age of the longest-waiting pending review, or `null` for an empty queue. */
export function queueAgeMs(
  oldestPendingAt: string | null | undefined,
  now: number = Date.now(),
): number | null {
  if (!oldestPendingAt) return null;
  const created = new Date(oldestPendingAt).getTime();
  if (Number.isNaN(created)) return null;
  // Clock skew between the server and this browser can put the timestamp in the
  // future; clamp rather than report a negative age.
  return Math.max(0, now - created);
}

export function queueAlertLevel(ageMs: number | null): QueueAlertLevel {
  if (ageMs === null) return "none";
  if (ageMs >= QUEUE_BLOCK_MS) return "block";
  if (ageMs >= QUEUE_WARN_MS) return "warn";
  return "none";
}

/**
 * A waiting *duration* in words ("3 days", "26 hours") — distinct from
 * `formatRelativeTime`, which labels a point in the past ("3d ago"). Both read
 * fine in a compact list; neither reads well in a sentence about how long
 * something has been ignored.
 */
export function formatQueueAge(ageMs: number): string {
  const hours = Math.floor(ageMs / HOUR);
  if (hours < 1) return "under an hour";
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  return `${days} days`;
}
