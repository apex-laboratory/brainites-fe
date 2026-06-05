import { useCallback, useState } from "react";
import { toast } from "sonner";

import { REVIEWS } from "../data/reviews";

export type ReviewVerdict = "approve" | "reject";

/**
 * Owns the review queue. Approving or rejecting removes the item and raises a
 * toast. The fixture total is captured once so progress can be shown even as
 * the queue drains.
 */
export function useReviews() {
  const [queue, setQueue] = useState(REVIEWS);

  const total = REVIEWS.length;
  const done = total - queue.length;

  const resolve = useCallback((id: string, verdict: ReviewVerdict) => {
    setQueue((current) => current.filter((review) => review.id !== id));
    toast.success(
      verdict === "approve"
        ? "Approved · merged into the brain"
        : "Rejected · change discarded"
    );
  }, []);

  const approve = useCallback(
    (id: string) => resolve(id, "approve"),
    [resolve]
  );
  const reject = useCallback((id: string) => resolve(id, "reject"), [resolve]);

  return { queue, total, done, approve, reject };
}
