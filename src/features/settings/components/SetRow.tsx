import { useState } from "react";
import { toast } from "sonner";

import { AppIcon } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

export interface SetRowProps {
  label: string;
  value: string;
  /** Render the value in the monospace font (URLs, ids). */
  mono?: boolean;
}

/** A label/value settings row with inline editing (prototype `SetRow`). */
export function SetRow({ label, value, mono }: SetRowProps) {
  const [current, setCurrent] = useState(value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => {
    setDraft(current);
    setEditing(true);
  };

  const cancel = () => setEditing(false);

  const save = () => {
    const next = draft.trim();
    setEditing(false);
    if (!next || next === current) return;
    setCurrent(next);
    toast.success(`${label} updated`);
  };

  return (
    <div className="flex items-center gap-3 border-b border-line-soft py-3 last:border-b-0">
      <span className="w-44 shrink-0 text-sm text-ink-3">{label}</span>

      {editing ? (
        <>
          <Input
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
              if (event.key === "Escape") cancel();
            }}
            aria-label={`Edit ${label}`}
            className={cn("h-8 max-w-[260px]", mono && "font-mono")}
          />
          <div className="ml-auto flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={cancel}>
              Cancel
            </Button>
            <Button variant="solid" size="sm" onClick={save}>
              <AppIcon name="check" size={14} />
              Save
            </Button>
          </div>
        </>
      ) : (
        <>
          <span
            className={cn(
              "text-[14.5px] font-semibold text-ink",
              mono && "font-mono"
            )}
          >
            {current}
          </span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={startEdit}>
            Edit
          </Button>
        </>
      )}
    </div>
  );
}
