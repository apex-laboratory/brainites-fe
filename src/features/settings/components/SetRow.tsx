import { useState } from "react";

import { AppIcon } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

type SetRowBase = {
  label: string;
  /** The displayed value. Server state — the row never shadows it. */
  value: string;
  /** Render the value in the monospace font (URLs, ids). */
  mono?: boolean;
};

/**
 * An editable row must be able to persist; a read-only one has nothing to save.
 * Expressed as a union so the invalid pairing can't be written.
 */
export type SetRowProps = SetRowBase &
  (
    | {
        editable?: true;
        /**
         * Persist the edited value. May be async; if it rejects the editor stays
         * open (the caller's mutation surfaces the error toast).
         */
        onSave: (value: string) => Promise<void> | void;
      }
    | { editable: false; onSave?: never }
  );

/**
 * A label/value settings row with inline editing (prototype `SetRow`).
 *
 * Controlled: the row owns only the *draft*, and always displays `value` from
 * props. The saved value therefore comes from the settings query — including any
 * normalization the backend applied — rather than from what the user typed.
 */
export function SetRow({ label, value, mono, editable = true, onSave }: SetRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const cancel = () => setEditing(false);

  const save = async () => {
    const next = draft.trim();
    if (!next || next === value) {
      setEditing(false);
      return;
    }
    try {
      setSaving(true);
      await onSave?.(next);
      setEditing(false);
    } catch {
      // Mutation already toasted the failure; keep the editor open for a retry.
    } finally {
      setSaving(false);
    }
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
            <Button variant="ghost" size="sm" onClick={cancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="solid" size="sm" onClick={save} disabled={saving}>
              <AppIcon name="check" size={14} />
              {saving ? "Saving…" : "Save"}
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
            {value || "—"}
          </span>
          {editable && (
            <Button variant="ghost" size="sm" className="ml-auto" onClick={startEdit}>
              Edit
            </Button>
          )}
        </>
      )}
    </div>
  );
}
