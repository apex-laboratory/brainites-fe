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
import { cn } from "@/utils/cn";

import type { MemberRole } from "../types";

const ROLES: MemberRole[] = ["Viewer", "Editor", "Admin"];

export interface InviteMemberDialogProps {
  trigger: ReactNode;
}

/** "Invite" dialog: email + role, sends an invitation (simulated). */
export function InviteMemberDialog({ trigger }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("Editor");

  const reset = () => {
    setEmail("");
    setRole("Editor");
  };

  const submit = () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    toast.success("Invitation sent", {
      description: `${trimmed} was invited as ${role}.`,
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
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            They&apos;ll get an email to join this workspace.
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
            <label htmlFor="invite-email" className="text-[13px] font-semibold text-ink-2">
              Email address
            </label>
            <Input
              id="invite-email"
              type="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@riverline.io"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-2">Role</span>
            <div className="grid grid-cols-3 gap-2.5">
              {ROLES.map((option) => {
                const on = role === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setRole(option)}
                    className={cn(
                      "rounded-md border bg-paper-2 py-2.5 text-center text-sm font-semibold text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      on ? "border-primary bg-brand-soft" : "border-line-2 hover:border-ink-4"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" variant="solid" disabled={!email.trim()}>
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
