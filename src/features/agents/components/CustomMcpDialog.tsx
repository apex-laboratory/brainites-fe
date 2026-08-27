import { useState, type FormEvent, type ReactNode } from "react";

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

import { ConnectorNameSchema, McpServerUrlSchema } from "../api";
import { useAddConnector } from "../hooks";

export interface CustomMcpDialogProps {
  agentId: string;
  trigger: ReactNode;
  /** Names already used on this agent — the backend 409s on a duplicate. */
  takenNames: string[];
}

/**
 * "Connect any MCP server" — the bottom row of the connector picker.
 *
 * Validates the two fields the backend is strict about, before spending a
 * round-trip that also pushes the agent's whole tool config to Anthropic:
 *
 *  - **name** must be a slug. It is not a label — it is the key Anthropic's
 *    `mcp_toolset.mcp_server_name` resolves against, so a space in it breaks
 *    the agent's tool wiring rather than just looking untidy.
 *  - **url** must be https. Anthropic connects to it carrying a vault
 *    credential, so a plaintext hop puts that credential on the wire.
 *
 * The duplicate-name check is local *and* server-side. Here it saves the
 * round-trip; there it settles the race between two tabs.
 */
export function CustomMcpDialog({ agentId, trigger, takenNames }: CustomMcpDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const addConnector = useAddConnector(agentId);

  const reset = () => {
    setName("");
    setUrl("");
    setError(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const parsedName = ConnectorNameSchema.safeParse(name);
    if (!parsedName.success) {
      setError(parsedName.error.issues[0]?.message ?? "That name won't work");
      return;
    }
    if (takenNames.includes(parsedName.data)) {
      setError("This agent already has a connector with that name");
      return;
    }
    const parsedUrl = McpServerUrlSchema.safeParse(url);
    if (!parsedUrl.success) {
      setError(parsedUrl.error.issues[0]?.message ?? "That URL won't work");
      return;
    }

    setError(null);
    addConnector.mutate(
      { name: parsedName.data, mcpServerUrl: parsedUrl.data },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
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
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Connect an MCP server</DialogTitle>
            <DialogDescription>
              Point this agent at any server that speaks MCP over HTTPS. It can use that
              server&apos;s tools during a run.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="mcp-name" className="text-xs font-medium">
                Name
              </label>
              <Input
                id="mcp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="linear"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                How the agent refers to this server. Letters, numbers, dashes — no spaces.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mcp-url" className="text-xs font-medium">
                Server URL
              </label>
              <Input
                id="mcp-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://mcp.example.com/mcp"
                inputMode="url"
              />
              <p className="text-xs text-muted-foreground">
                Must be https — the connection carries your credentials.
              </p>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addConnector.isPending}>
              {addConnector.isPending ? "Connecting…" : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
