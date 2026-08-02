import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { reviewKeys } from "@/features/reviews/api";
import { isApiError, type Page } from "@/lib/api";

import {
  DRAFT_LIST_PARAMS,
  skillKeys,
  skillsApi,
  type SkillListItem,
  type SkillSubmitResult,
} from "../api";

/** The Drafts tab's cache shape (`useInfiniteQuery` over `skillsApi.list`). */
type DraftPages = InfiniteData<Page<SkillListItem[]>, string | null>;

export type SubmitSkillVariables = {
  skillId: string;
  /** Row name — used only for toast copy, never sent to the backend. */
  name?: string;
  /** Context for the reviewer (≤ `SUBMIT_NOTE_MAX_LENGTH`). Lands on the
   * review's payload, not on the skill. */
  note?: string;
};

/**
 * What the submit actually resolved to. The backend's 404 and both 409s mean
 * the row the user clicked is out of date — the skill was published, already
 * queued by a concurrent submit, or deleted. None of those are failures the
 * user can act on (the intent is either already satisfied or moot), so they
 * resolve as `stale` and get a neutral toast plus a refetch, leaving the global
 * red error toast for the failures that *are* actionable (403, 422, 5xx).
 */
type SubmitOutcome =
  | { kind: "submitted"; result: SkillSubmitResult }
  | { kind: "stale"; message: string; gone: boolean };

/** Rollback snapshot for the optimistic status flip. */
type Context = { previous: DraftPages | undefined };

/**
 * Submits a draft to the review queue via `POST /skills/{id}/submit`
 * (admin-only). The row is optimistically flipped to `review` so the badge
 * changes under the cursor, then the drafts list, the registry stats and the
 * review queue are all invalidated — the row leaves the `status=draft` list and
 * the queue badge picks up the new card.
 */
export function useSubmitSkill() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const draftsKey = skillKeys.list(workspaceId, DRAFT_LIST_PARAMS);

  /** Refetch everything the submit moved: drafts list + `/skills/stats`, and
   * the review queue that just gained (or reused) a card. */
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: skillKeys.all(workspaceId) });
    queryClient.invalidateQueries({ queryKey: reviewKeys.all(workspaceId) });
  };

  const rollback = (context: Context | undefined) => {
    if (context?.previous) queryClient.setQueryData(draftsKey, context.previous);
  };

  return useMutation<SubmitOutcome, Error, SubmitSkillVariables, Context>({
    mutationFn: async ({ skillId, note }) => {
      const trimmed = note?.trim();
      try {
        return {
          kind: "submitted",
          result: await skillsApi.submit(
            skillId,
            trimmed ? { note: trimmed } : undefined,
          ),
        };
      } catch (err) {
        if (isApiError(err) && (err.code === "conflict" || err.code === "not_found")) {
          return { kind: "stale", message: err.message, gone: err.code === "not_found" };
        }
        throw err;
      }
    },

    onMutate: async ({ skillId }) => {
      // Cancel first: an in-flight drafts refetch that lands after the write
      // would quietly reinstate the row's `draft` badge.
      await queryClient.cancelQueries({ queryKey: draftsKey });
      const previous = queryClient.getQueryData<DraftPages>(draftsKey);

      queryClient.setQueryData<DraftPages>(draftsKey, (current) =>
        current && {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === skillId ? { ...item, status: "review" } : item,
            ),
          })),
        },
      );

      return { previous };
    },

    onSuccess: (outcome, variables, context) => {
      const label = variables.name ? `“${variables.name}”` : "The skill";

      if (outcome.kind === "stale") {
        // Undo the flip before refetching — on a 409 the skill's real status
        // may be `active`, and "Needs review" would be the wrong interim badge.
        rollback(context);
        toast.info(
          outcome.gone ? "That skill no longer exists" : "That skill isn't a draft anymore",
          { description: outcome.message },
        );
        invalidate();
        return;
      }

      toast.success("Sent for review", {
        description: outcome.result.reviewCreated
          ? `${label} is now in the review queue.`
          : `${label} already had an open review card — the reviewer will see it there.`,
      });
      invalidate();
    },

    // State only; the global handler in `query-client.ts` renders the toast.
    onError: (_err, _variables, context) => rollback(context),

    meta: {
      errorMessage: "Couldn't submit the skill for review.",
      errorMessages: {
        forbidden: "Submitting a skill for review is admin-only.",
      },
    },
  });
}
