import { useEffect, useState } from "react";

import { AppIcon, ErrorState, Skeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useSkill } from "../hooks/useSkill";
import { useUpdateSkill } from "../hooks/useUpdateSkill";
import {
  SKILL_BASE_LOGIC_MAX_LENGTH,
  SKILL_DESCRIPTION_MAX_LENGTH,
  SKILL_NAME_MAX_LENGTH,
  SKILL_TRIGGER_MAX_LENGTH,
  type UpdateSkillBody,
} from "../api";

export interface EditSkillDialogProps {
  /** The skill to edit; `null` keeps the dialog closed and the query idle. */
  skillId: string | null;
  /** Name from the table row, shown as the title until the fetch lands. */
  skillName?: string;
  onClose: () => void;
}

type Draft = {
  name: string;
  trigger: string;
  baseLogic: string;
  description: string;
};

/**
 * Edit an existing skill (`PATCH /skills/{id}`, editor or admin). The current
 * body is fetched fresh so the form always edits what's live, not a stale table
 * row. Only the fields the user actually changed are sent — the backend re-embeds
 * only when the trigger or logic moves, so a name-only edit stays cheap.
 */
export function EditSkillDialog({ skillId, skillName, onClose }: EditSkillDialogProps) {
  const { skill, isPending, isError, error, refetch } = useSkill(skillId);
  const updateSkill = useUpdateSkill();

  const [draft, setDraft] = useState<Draft | null>(null);

  // Prefill once the body lands (and re-prefill if a different skill opens).
  useEffect(() => {
    if (!skill) {
      setDraft(null);
      return;
    }
    setDraft({
      name: skill.name ?? "",
      trigger: skill.trigger ?? "",
      baseLogic: skill.baseLogic ?? "",
      description: skill.description ?? "",
    });
  }, [skill]);

  const set = (patch: Partial<Draft>) =>
    setDraft((current) => (current ? { ...current, ...patch } : current));

  // Only the fields that changed from the loaded body — the backend treats an
  // absent key as "leave untouched", so this is a true partial update.
  const changes: UpdateSkillBody = {};
  if (skill && draft) {
    if (draft.name.trim() !== (skill.name ?? "")) changes.name = draft.name.trim();
    if (draft.trigger.trim() !== (skill.trigger ?? ""))
      changes.trigger = draft.trigger.trim();
    if (draft.baseLogic.trim() !== (skill.baseLogic ?? ""))
      changes.baseLogic = draft.baseLogic.trim();
    if (draft.description.trim() !== (skill.description ?? ""))
      changes.description = draft.description.trim();
  }

  const hasChanges = Object.keys(changes).length > 0;
  // Name and base logic are required (the backend rejects an empty string on
  // either), so block a save that would blank them.
  const isValid =
    !!draft && draft.name.trim().length > 0 && draft.baseLogic.trim().length > 0;
  const canSave = hasChanges && isValid && !updateSkill.isPending;

  const save = () => {
    if (!canSave || !skillId) return;
    updateSkill.mutate(
      { skillId, body: changes, name: changes.name ?? skill?.name },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={skillId !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="break-words">
            Edit {skill?.name ?? skillName ?? "skill"}
          </DialogTitle>
          <DialogDescription>
            Change what your agents call. Editing the trigger or logic re-indexes
            the skill for search.
          </DialogDescription>
        </DialogHeader>

        {isError ? (
          <ErrorState error={error} onRetry={refetch} title="Couldn't load this skill" />
        ) : isPending || !draft ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-skill-name" className="text-[13px] font-semibold text-ink-2">
                Skill name
              </label>
              <Input
                id="edit-skill-name"
                autoFocus
                maxLength={SKILL_NAME_MAX_LENGTH}
                value={draft.name}
                onChange={(event) => set({ name: event.target.value })}
                placeholder="refund.eligibility"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-skill-trigger" className="text-[13px] font-semibold text-ink-2">
                Trigger <span className="font-normal text-ink-4">· optional</span>
              </label>
              <Input
                id="edit-skill-trigger"
                maxLength={SKILL_TRIGGER_MAX_LENGTH}
                value={draft.trigger}
                onChange={(event) => set({ trigger: event.target.value })}
                placeholder="when a refund is requested"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-skill-logic" className="text-[13px] font-semibold text-ink-2">
                Base logic
              </label>
              <Textarea
                id="edit-skill-logic"
                maxLength={SKILL_BASE_LOGIC_MAX_LENGTH}
                value={draft.baseLogic}
                onChange={(event) => set({ baseLogic: event.target.value })}
                placeholder="IF customer.tier = premium AND days_since_purchase ≤ 45 THEN approve_refund()"
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-skill-desc" className="text-[13px] font-semibold text-ink-2">
                What it does <span className="font-normal text-ink-4">· optional</span>
              </label>
              <Textarea
                id="edit-skill-desc"
                maxLength={SKILL_DESCRIPTION_MAX_LENGTH}
                value={draft.description}
                onChange={(event) => set({ description: event.target.value })}
                placeholder="Decides whether an order qualifies for a refund."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="solid" disabled={!canSave}>
                <AppIcon name="edit" size={15} />
                {updateSkill.isPending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
