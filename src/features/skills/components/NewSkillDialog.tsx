import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCreateSkill } from "../hooks/useCreateSkill";

export interface NewSkillDialogProps {
  trigger: ReactNode;
}

/**
 * "New skill" dialog: drafts a skill via `POST /skills` (admin-only). `name` and
 * `baseLogic` are required; `trigger` and `description` are optional. The skill
 * lands at status `draft` and opens a review.
 */
export function NewSkillDialog({ trigger }: NewSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [trigger_, setTrigger] = useState("");
  const [baseLogic, setBaseLogic] = useState("");
  const [description, setDescription] = useState("");

  const createSkill = useCreateSkill();

  const reset = () => {
    setName("");
    setTrigger("");
    setBaseLogic("");
    setDescription("");
  };

  const canSubmit = name.trim().length > 0 && baseLogic.trim().length > 0;

  const submit = () => {
    if (!canSubmit || createSkill.isPending) return;
    createSkill.mutate(
      {
        name: name.trim(),
        baseLogic: baseLogic.trim(),
        trigger: trigger_.trim() || undefined,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>New skill</DialogTitle>
          <DialogDescription>
            Define an executable capability your agents can call. It starts as a
            draft in the review queue until you publish it.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="skill-name" className="text-[13px] font-semibold text-ink-2">
              Skill name
            </label>
            <Input
              id="skill-name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="refund.eligibility"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="skill-trigger" className="text-[13px] font-semibold text-ink-2">
              Trigger <span className="font-normal text-ink-4">· optional</span>
            </label>
            <Input
              id="skill-trigger"
              value={trigger_}
              onChange={(event) => setTrigger(event.target.value)}
              placeholder="when a refund is requested"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="skill-logic" className="text-[13px] font-semibold text-ink-2">
              Base logic
            </label>
            <Textarea
              id="skill-logic"
              value={baseLogic}
              onChange={(event) => setBaseLogic(event.target.value)}
              placeholder="IF customer.tier = premium AND days_since_purchase ≤ 45 THEN approve_refund()"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="skill-desc" className="text-[13px] font-semibold text-ink-2">
              What it does <span className="font-normal text-ink-4">· optional</span>
            </label>
            <Textarea
              id="skill-desc"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Decides whether an order qualifies for a refund."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              variant="solid"
              disabled={!canSubmit || createSkill.isPending}
            >
              {createSkill.isPending ? "Creating…" : "Create skill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
