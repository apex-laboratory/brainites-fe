import { useState, type FormEvent, type ReactNode } from "react";

import { AppIcon, SourceTile } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SOURCE_LIST } from "@/constants/sources";

import { SubdomainSchema, needsSubdomain, type SourceProvider } from "../api";
import { useConnectSource } from "../hooks/useConnectSource";

export interface AddSourceDialogProps {
  trigger: ReactNode;
  /** Providers already connected — hidden from the list. */
  connected: SourceProvider[];
}

/**
 * "Add source" dialog: pick a provider and begin its OAuth consent flow.
 * Choosing a provider hands the browser to the provider; on return the backend
 * redirects to `/settings/sources?connected=…`, which the Sources page handles.
 */
export function AddSourceDialog({ trigger, connected }: AddSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<SourceProvider | null>(null);
  const connect = useConnectSource();

  const available = SOURCE_LIST.filter((meta) => !connected.includes(meta.id));

  const start = (provider: SourceProvider) => {
    // Zendesk needs a tenant subdomain before we can build the consent URL.
    if (needsSubdomain(provider)) return setPendingProvider(provider);
    connect.mutate({ provider });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPendingProvider(null);
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

        {pendingProvider ? (
          <SubdomainForm
            provider={pendingProvider}
            isPending={connect.isPending}
            onCancel={() => setPendingProvider(null)}
            onSubmit={(subdomain) => connect.mutate({ provider: pendingProvider, subdomain })}
          />
        ) : available.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-ink-3">
            Every available source is already connected.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {available.map((meta) => (
              <div
                key={meta.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3.5 py-3"
              >
                <SourceTile id={meta.id} size={40} iconSize={20} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink">{meta.name}</div>
                  <div className="truncate text-[12.5px] text-ink-3">{meta.tag}</div>
                </div>
                <Button
                  variant="solid"
                  size="sm"
                  disabled={connect.isPending}
                  onClick={() => start(meta.id)}
                >
                  <AppIcon name="link" size={14} />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Zendesk (and any future subdomain-scoped provider) needs a tenant name. */
function SubdomainForm({
  provider,
  isPending,
  onCancel,
  onSubmit,
}: {
  provider: SourceProvider;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (subdomain: string) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = SubdomainSchema.safeParse(value);
    if (!result.success) return setError(result.error.issues[0].message);
    setError(null);
    onSubmit(result.data);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label htmlFor="subdomain" className="text-[13px] font-semibold text-ink">
        Your {provider} subdomain
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="subdomain"
          autoFocus
          value={value}
          placeholder="acme"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "subdomain-error" : undefined}
          onChange={(event) => setValue(event.target.value)}
        />
        <span className="shrink-0 text-[13px] text-ink-3">.zendesk.com</span>
      </div>
      {error && (
        <p id="subdomain-error" className="text-[12.5px] text-amber">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Back
        </Button>
        <Button type="submit" variant="solid" size="sm" disabled={isPending}>
          <AppIcon name="link" size={14} />
          {isPending ? "Connecting…" : "Connect"}
        </Button>
      </div>
    </form>
  );
}
