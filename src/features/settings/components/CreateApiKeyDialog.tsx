import { type ReactNode, useState } from "react";

import { AppIcon } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
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
import { useCopyToClipboard } from "@/hooks";

import {
  API_KEY_SCOPES,
  SCOPE_LABEL,
  type ApiKeyCreated,
  type ApiKeyScope,
} from "../api";

export interface CreateApiKeyDialogProps {
  trigger: ReactNode;
  /** Mints the key. Rejects → the dialog stays open (error toasted upstream). */
  onCreate: (name: string, scopes: ApiKeyScope[]) => Promise<ApiKeyCreated>;
  pending?: boolean;
}

/**
 * Mint a workspace API key.
 *
 * Two phases in one dialog: the form, then the secret. The raw key comes back
 * exactly once from `POST /api-keys`, so it lives in this component's state and
 * nowhere else — not the query cache, not a parent — and is dropped the moment
 * the dialog closes.
 */
export function CreateApiKeyDialog({
  trigger,
  onCreate,
  pending = false,
}: CreateApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<ApiKeyScope[]>([...API_KEY_SCOPES]);
  const [created, setCreated] = useState<ApiKeyCreated | null>(null);
  const { copy } = useCopyToClipboard();

  const reset = () => {
    setName("");
    setScopes([...API_KEY_SCOPES]);
    setCreated(null);
  };

  const toggleScope = (scope: ApiKeyScope) =>
    setScopes((current) =>
      current.includes(scope)
        ? current.filter((s) => s !== scope)
        : [...current, scope],
    );

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || scopes.length === 0) return;
    try {
      setCreated(await onCreate(trimmed, scopes));
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
      <DialogContent className="max-w-[480px]">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Copy your key now</DialogTitle>
              <DialogDescription>
                This is the only time the full key is shown. Store it as a secret
                — you can revoke it and mint a new one if it's lost.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2.5 rounded-[11px] bg-solid px-4 py-3">
              <span className="min-w-0 flex-1 break-all font-mono text-[12.5px] text-solid-ink">
                {created.apiKey}
              </span>
              <Button
                size="sm"
                onClick={() => copy(created.apiKey, "API key copied")}
                className="h-[30px] flex-none bg-white/10 text-solid-ink shadow-none hover:bg-white/20"
              >
                <AppIcon name="link" size={13} />
                Copy
              </Button>
            </div>

            <DialogFooter>
              <Button variant="solid" onClick={() => setOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create an API key</DialogTitle>
              <DialogDescription>
                Keys let agents and services query this workspace's brain.
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
                <label
                  htmlFor="api-key-name"
                  className="text-[13px] font-semibold text-ink-2"
                >
                  Name
                </label>
                <Input
                  id="api-key-name"
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Support agent"
                />
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-[13px] font-semibold text-ink-2">
                  Scopes
                </legend>
                {API_KEY_SCOPES.map((scope) => (
                  <label
                    key={scope}
                    className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-ink-2"
                  >
                    <input
                      type="checkbox"
                      checked={scopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                      className="size-4 cursor-pointer accent-brand"
                    />
                    <Badge variant="outline" className="font-mono">
                      {scope}
                    </Badge>
                    {SCOPE_LABEL[scope]}
                  </label>
                ))}
              </fieldset>

              <DialogFooter>
                <Button
                  type="submit"
                  variant="solid"
                  disabled={pending || !name.trim() || scopes.length === 0}
                >
                  {pending ? "Creating…" : "Create key"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
