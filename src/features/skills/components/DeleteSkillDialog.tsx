import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/shared";

import { useDeleteSkill } from "../hooks/useDeleteSkill";

export interface DeleteSkillDialogProps {
  /** The skill to delete; `null` keeps the dialog closed. */
  skill: { id: string; name: string } | null;
  onClose: () => void;
}

/**
 * Confirmation before soft-deleting a skill (`DELETE /skills/{id}`, admin-only).
 * A deliberate two-step because the action is destructive — agents lose the
 * capability the moment it's removed.
 */
export function DeleteSkillDialog({ skill, onClose }: DeleteSkillDialogProps) {
  const deleteSkill = useDeleteSkill();

  const confirm = () => {
    if (!skill || deleteSkill.isPending) return;
    deleteSkill.mutate(
      { skillId: skill.id, name: skill.name },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={skill !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete this skill?</DialogTitle>
          <DialogDescription>
            {skill ? (
              <>
                “{skill.name}” will be removed from the registry and your agents
                can no longer call it. This can’t be undone from here.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirm}
            disabled={deleteSkill.isPending}
          >
            <AppIcon name="delete" size={15} />
            {deleteSkill.isPending ? "Deleting…" : "Delete skill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
