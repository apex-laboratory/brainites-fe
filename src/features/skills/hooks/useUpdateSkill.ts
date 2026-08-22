import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkspaceId } from "@/app/providers/AuthProvider";

import { skillKeys, skillsApi, type UpdateSkillBody } from "../api";

export type UpdateSkillVariables = {
  skillId: string;
  body: UpdateSkillBody;
  /** Row name for toast copy; the request carries `body.name` when renaming. */
  name?: string;
};

/**
 * Edits a skill via `PATCH /skills/{id}` (editor or admin). On success the
 * registry list/stats and this skill's detail cache are invalidated so the row
 * and the open dialog both pick up the new body. A non-editor 403 and a
 * duplicate-name 409 surface as their own toasts.
 */
export function useUpdateSkill() {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ skillId, body }: UpdateSkillVariables) =>
      skillsApi.update(skillId, body),
    onSuccess: (skill, variables) => {
      const label = variables.name ?? skill.name;
      toast.success("Skill updated", { description: `“${label}” was saved.` });
      queryClient.invalidateQueries({ queryKey: skillKeys.all(workspaceId) });
      queryClient.invalidateQueries({
        queryKey: skillKeys.detail(workspaceId, variables.skillId),
      });
    },
    meta: {
      errorMessage: "Couldn't save the skill.",
      errorMessages: {
        forbidden: "Editing skills requires editor access.",
        conflict: "A skill with that name already exists.",
        not_found: "That skill no longer exists.",
      },
    },
  });
}
