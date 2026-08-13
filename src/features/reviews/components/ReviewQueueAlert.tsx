import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AppIcon } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";

import { useReviewQueueAlert } from "../hooks/useReviewQueueAlert";

/**
 * A stable id so the toast updates in place as the queue changes instead of
 * stacking a fresh copy on every poll.
 */
const WARN_TOAST_ID = "review-queue-stalled";

function items(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

/**
 * The escalating half of the review-queue reminder: a dismissible toast once
 * the oldest pending item passes a day, and a modal the admin has to
 * acknowledge once it passes three. The always-on count badge is separate —
 * see `useReviewCount`, which reads the same query.
 *
 * Renders nothing at rest. Mounted once in the dashboard shell rather than per
 * page, so the alert follows the admin around the app; kept out of the layout
 * component itself so its per-minute age tick re-renders a leaf and not the
 * whole dashboard.
 */
export function ReviewQueueAlert() {
  const navigate = useNavigate();
  const { pending, ageLabel, showWarn, showBlock, snoozeWarn, acknowledgeBlock } =
    useReviewQueueAlert();

  useEffect(() => {
    if (!showWarn) {
      // Covers the queue draining, a dismissal, and escalation to the modal —
      // in every case the toast has stopped being true.
      toast.dismiss(WARN_TOAST_ID);
      return;
    }

    toast.warning("The review queue is backing up", {
      id: WARN_TOAST_ID,
      description: `${items(pending)} pending, the oldest waiting ${ageLabel}. Nothing reaches the skill registry until it's approved.`,
      // Deliberately not auto-closing: this is the rung before a blocking
      // modal, and a toast that vanishes after four seconds is the thing we're
      // trying to stop being ignored. Both buttons close it.
      duration: Infinity,
      action: {
        label: "Review now",
        onClick: () => {
          snoozeWarn();
          navigate(ROUTES.reviews);
        },
      },
      cancel: { label: "Later", onClick: snoozeWarn },
    });
  }, [showWarn, pending, ageLabel, snoozeWarn, navigate]);

  // The toast lives in a portal outside this tree, so unmounting (logout,
  // leaving the dashboard) would otherwise strand it on screen.
  useEffect(
    () => () => {
      toast.dismiss(WARN_TOAST_ID);
    },
    [],
  );

  return (
    <Dialog open={showBlock}>
      <DialogContent
        className="max-w-[460px]"
        hideClose
        // No escape hatch: acknowledging this is the point, so the only ways
        // out are the two buttons below.
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-1 grid size-11 place-items-center rounded-full bg-amber-soft">
            <AppIcon name="warning" size={22} className="text-amber" />
          </div>
          <DialogTitle>The review queue has stalled</DialogTitle>
          <DialogDescription>
            {items(pending)} have been waiting for approval — the oldest for{" "}
            {ageLabel}. Every extracted skill now needs a human decision, so
            until this queue moves your knowledge base has stopped updating.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={acknowledgeBlock}
          >
            Not right now
          </Button>
          <Button
            onClick={() => {
              acknowledgeBlock();
              navigate(ROUTES.reviews);
            }}
          >
            <AppIcon name="review" size={16} />
            Open the review queue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
