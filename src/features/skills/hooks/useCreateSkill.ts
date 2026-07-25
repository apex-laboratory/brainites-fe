import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { skillKeys, skillsApi, type CreateSkillBody } from "../api";

/**
 * Creates a skill via `POST /skills` (admin-only). On success the skill lands at
 * status `draft` and opens a review, so the toast points the user at the queue;
 * the list/stats queries are invalidated so the new draft shows up. A non-admin
 * 403 and a duplicate-name 409 surface as their own toasts.
 */
export function useCreateSkill() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSkillBody) => skillsApi.create(body),
    onSuccess: (skill) => {
      toast.success("Skill drafted", {
        description: `“${skill.name}” was added to the registry and opened for review.`,
      });
      queryClient.invalidateQueries({ queryKey: skillKeys.all(workspaceId) });
    },
    meta: {
      errorMessage: "Couldn't create the skill.",
      errorMessages: {
        forbidden: "Creating skills is admin-only.",
        conflict: "A skill with that name already exists.",
      },
    },
  });
}
