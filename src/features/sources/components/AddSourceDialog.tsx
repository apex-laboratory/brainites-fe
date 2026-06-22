import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import { AppIcon, type AppIconName } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Integration = {
  name: string;
  desc: string;
  icon: AppIconName;
};

/** Integrations beyond the ones already connected — requestable for now. */
const AVAILABLE: Integration[] = [
  { name: "Linear", desc: "Issues, projects and cycles", icon: "decision" },
  { name: "Confluence", desc: "Spaces, pages and docs", icon: "document" },
  { name: "Intercom", desc: "Conversations and help center", icon: "review" },
];

export interface AddSourceDialogProps {
  trigger: ReactNode;
}

/** "Add source" dialog: pick another integration to connect (simulated). */
export function AddSourceDialog({ trigger }: AddSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState<string[]>([]);

  const request = (name: string) => {
    setRequested((prev) => [...prev, name]);
    toast.success(`${name} connection started`, {
      description: "We'll let you know once the first sync completes.",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setRequested([]);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Add a source</DialogTitle>
          <DialogDescription>
            Connect another tool for your brain to read from. Read-only, synced
            continuously.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5">
          {AVAILABLE.map((item) => {
            const done = requested.includes(item.name);
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3.5 py-3"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-cream text-ink-2">
                  <AppIcon name={item.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink">{item.name}</div>
                  <div className="truncate text-[12.5px] text-ink-3">
                    {item.desc}
                  </div>
                </div>
                <Button
                  variant={done ? "outline" : "solid"}
                  size="sm"
                  disabled={done}
                  onClick={() => request(item.name)}
                >
                  {done ? (
                    <>
                      <AppIcon name="check" size={14} />
                      Connecting
                    </>
                  ) : (
                    <>
                      <AppIcon name="link" size={14} />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
