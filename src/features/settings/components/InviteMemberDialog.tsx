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
import { cn } from "@/utils/cn";

import { ROLE_LABEL, type MemberRole } from "../api";

const ROLES: MemberRole[] = ["viewer", "editor", "admin"];

export interface InviteMemberDialogProps {
  trigger: ReactNode;
  /** Sends the invite. Rejects → the dialog stays open (error toasted upstream). */
  onInvite: (email: string, role: MemberRole) => Promise<void>;
  pending?: boolean;
}

/** "Invite" dialog: email + role, sends a real invitation via `onInvite`. */
export function InviteMemberDialog({ trigger, onInvite, pending = false }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("editor");

  const reset = () => {
    setEmail("");
    setRole("editor");
  };

  const submit = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      await onInvite(trimmed, role);
      reset();
      setOpen(false);
    } catch {
      // Upstream mutation surfaces the error toast; keep the dialog open.
    }
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
            void submit();
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
              placeholder="teammate@company.com"
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
                    {ROLE_LABEL[option]}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" variant="solid" disabled={!email.trim() || pending}>
              {pending ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
