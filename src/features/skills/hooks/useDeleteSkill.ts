import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { isApiError } from "@/lib/api";

import { skillKeys, skillsApi } from "../api";

export type DeleteSkillVariables = {
  skillId: string;
  /** Row name — used only for toast copy, never sent to the backend. */
  name?: string;
};

/** A delete that hit a 404 — the skill was already gone. Not an actionable
 * failure (the intent is already satisfied), so it resolves as `stale` and gets
 * a neutral toast plus a refetch rather than the global red error toast. */
type DeleteOutcome = { kind: "deleted" } | { kind: "stale"; message: string };

/**
 * Soft-deletes a skill via `DELETE /skills/{id}` (admin-only). On success the
 * registry list and stats are invalidated so the row drops out. A non-admin 403
 * surfaces as its own toast; a 404 means the row was already removed and is
 * treated as a benign no-op.
 */
export function useDeleteSkill() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: skillKeys.all(workspaceId) });

  return useMutation<DeleteOutcome, Error, DeleteSkillVariables>({
    mutationFn: async ({ skillId }) => {
      try {
        await skillsApi.remove(skillId);
        return { kind: "deleted" };
      } catch (err) {
        if (isApiError(err) && err.code === "not_found") {
          return { kind: "stale", message: err.message };
        }
        throw err;
      }
    },
    onSuccess: (outcome, variables) => {
      const label = variables.name ? `“${variables.name}”` : "The skill";
      if (outcome.kind === "stale") {
        toast.info("That skill no longer exists", { description: outcome.message });
      } else {
        toast.success("Skill deleted", { description: `${label} was removed.` });
      }
      invalidate();
    },
    meta: {
      errorMessage: "Couldn't delete the skill.",
      errorMessages: {
        forbidden: "Deleting skills is admin-only.",
      },
    },
  });
}
