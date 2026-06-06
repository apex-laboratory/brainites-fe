import { type ReactNode, useState } from "react";
import { toast } from "sonner";

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

export interface NewSkillDialogProps {
  trigger: ReactNode;
}

/** "New skill" dialog: name + description, drafts a skill (simulated). */
export function NewSkillDialog({ trigger }: NewSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const reset = () => {
    setName("");
    setDesc("");
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    toast.success("Skill drafted", {
      description: `“${trimmed}” was added to the registry in review.`,
    });
    reset();
    setOpen(false);
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
            Define an executable capability your agents can call. It starts in
            review until you publish it.
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
            <label htmlFor="skill-desc" className="text-[13px] font-semibold text-ink-2">
              What it does
            </label>
            <Textarea
              id="skill-desc"
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
              placeholder="Decides whether an order qualifies for a refund."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" variant="solid" disabled={!name.trim()}>
              Create skill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
