import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/constants/routes";
import { useLocalStorage } from "@/hooks/useLocalStorage";

import {
  formatQueueAge,
  queueAgeMs,
  queueAlertLevel,
  type QueueAlertLevel,
} from "../utils/escalation";
import { useReviewStats } from "./useReviewStats";

/**
 * How long each rung stays quiet after the admin responds to it.
 *
 * These are snoozes, not acknowledgements-forever. Keying "already seen" to the
 * queue's own state instead would go silent permanently in exactly the case the
 * feature exists for: an admin who dismisses and then does nothing leaves
 * `oldestPendingAt` unchanged, so a state-keyed dismissal would never fire
 * again. Time-boxing means ignoring it costs you another prompt.
 */
const WARN_SNOOZE_MS = 12 * 60 * 60 * 1000;
const BLOCK_SNOOZE_MS = 4 * 60 * 60 * 1000;

/** Recompute cadence for the queue's age. See the `now` note below. */
const TICK_MS = 60_000;

type Snooze = { warnUntil?: number; blockUntil?: number };

export interface ReviewQueueAlertState {
  pending: number;
  /** Escalation implied by the queue's age alone, before any snooze. */
  level: QueueAlertLevel;
  /** How long the oldest item has waited, in words ("26 hours", "4 days"). */
  ageLabel: string | null;
  showWarn: boolean;
  showBlock: boolean;
  /** Dismiss the toast for `WARN_SNOOZE_MS`. */
  snoozeWarn: () => void;
  /** Acknowledge the blocking modal for `BLOCK_SNOOZE_MS`. */
  acknowledgeBlock: () => void;
}

/**
 * Drives the toast and the blocking modal off `/reviews/stats`.
 *
 * Both rungs come from the same query as the nav badge, so the three can't
 * disagree about the queue. Neither fires while the admin is already on the
 * Reviews page — they're there to get someone to that page, and interrupting
 * the triage they're mid-way through would be the opposite of helpful.
 */
export function useReviewQueueAlert(): ReviewQueueAlertState {
  const workspaceId = useWorkspaceId();
  const stats = useReviewStats();
  const onReviewsPage = useLocation().pathname === ROUTES.reviews;

  const [snooze, setSnooze] = useLocalStorage<Snooze>(
    `brainite.review-alert.${workspaceId}`,
    {},
  );

  // The queue's age advances on its own, but nothing re-renders when it does:
  // a poll that returns identical stats is structurally shared, so `data` keeps
  // its reference and no subscriber wakes up. A tab left open would sit at the
  // level it had on load and sail past both thresholds in silence. This ticks
  // `now` so the age — and an expiring snooze — is re-evaluated on a schedule.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const ageMs = queueAgeMs(stats?.oldestPendingAt, now);
  const level = queueAlertLevel(ageMs);

  // A queue that drained (or whose oldest item was finally resolved) ends the
  // episode — the next stall deserves a fresh prompt rather than the tail of a
  // snooze set for the last one.
  const isSnoozed = snooze.warnUntil !== undefined || snooze.blockUntil !== undefined;
  useEffect(() => {
    if (level === "none" && isSnoozed) setSnooze({});
  }, [level, isSnoozed, setSnooze]);

  const snoozeWarn = useCallback(
    () => setSnooze((prev) => ({ ...prev, warnUntil: Date.now() + WARN_SNOOZE_MS })),
    [setSnooze],
  );
  const acknowledgeBlock = useCallback(
    () => setSnooze((prev) => ({ ...prev, blockUntil: Date.now() + BLOCK_SNOOZE_MS })),
    [setSnooze],
  );

  const showBlock =
    level === "block" && !onReviewsPage && !((snooze.blockUntil ?? 0) > now);
  // The modal supersedes the toast rather than stacking on it.
  const showWarn =
    level === "warn" && !onReviewsPage && !((snooze.warnUntil ?? 0) > now);

  return {
    pending: stats?.pending ?? 0,
    level,
    ageLabel: ageMs === null ? null : formatQueueAge(ageMs),
    showWarn,
    showBlock,
    snoozeWarn,
    acknowledgeBlock,
  };
}
