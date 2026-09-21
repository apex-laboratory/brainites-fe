import { useMemo, useState, type FormEvent } from "react";

import { SectionLabel, Segmented } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";

import {
  AgentNameSchema,
  EFFORT_LABELS,
  MODEL_LABELS,
  SYSTEM_PROMPT_MAX,
  type Agent,
  type AgentEffort,
  type AgentModel,
  type AgentUpdateBody,
} from "../api";
import {
  changedFields,
  formStateFrom,
  type AgentFormState,
} from "../utils/form";
import { GroundingToggle } from "./GroundingToggle";

export interface AgentBuilderFormProps {
  /** Absent when creating. */
  agent?: Agent;
  saving: boolean;
  readOnly?: boolean;
  onSubmit: (state: AgentFormState, changed: AgentUpdateBody) => void;
  /** Rendered between the prompt and the grounding toggle — the connector
   * picker, which needs an agent id and so cannot exist while creating. */
  children?: React.ReactNode;
}

/**
 * The builder form: name, description, system prompt, model + effort, grounding.
 *
 * Read-only for a non-owner. RLS lets any member see a published agent, but
 * editing is the owner's alone — the server enforces it, and disabling the
 * fields is how the user finds that out before they've typed a paragraph.
 */
export function AgentBuilderForm({
  agent,
  saving,
  readOnly,
  onSubmit,
  children,
}: AgentBuilderFormProps) {
  const original = useMemo(() => formStateFrom(agent), [agent]);
  const [state, setState] = useState<AgentFormState>(original);
  const [nameError, setNameError] = useState<string | null>(null);

  const changed = changedFields(state, original);
  const isDirty = Object.keys(changed).length > 0;

  const set = <K extends keyof AgentFormState>(key: K, value: AgentFormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = AgentNameSchema.safeParse(state.name);
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? "Give the agent a name");
      return;
    }
    setNameError(null);
    onSubmit({ ...state, name: parsed.data }, changed);
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="agent-name" className="text-xs font-medium">
            Name
          </label>
          <Input
            id="agent-name"
            value={state.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Refund handler"
            disabled={readOnly}
          />
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="agent-description" className="text-xs font-medium">
            Description
          </label>
          <Input
            id="agent-description"
            value={state.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What this agent is for — shown on its card."
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="agent-prompt" className="text-xs font-medium">
          Instructions
        </label>
        <Textarea
          id="agent-prompt"
          value={state.systemPrompt}
          onChange={(e) => set("systemPrompt", e.target.value.slice(0, SYSTEM_PROMPT_MAX))}
          placeholder="How this agent should behave, what it should never do, and how to decide when it's unsure."
          rows={8}
          disabled={readOnly}
        />
        <p className="text-xs text-muted-foreground">
          {state.systemPrompt.length.toLocaleString()} / {SYSTEM_PROMPT_MAX.toLocaleString()}
        </p>
      </div>

      <div className="space-y-3">
        <SectionLabel>Model</SectionLabel>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(MODEL_LABELS) as AgentModel[]).map((model) => (
            <button
              key={model}
              type="button"
              disabled={readOnly}
              onClick={() => set("model", model)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                state.model === model ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                readOnly && "cursor-not-allowed opacity-60",
              )}
            >
              <span className="block text-sm font-medium">{MODEL_LABELS[model].label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {MODEL_LABELS[model].hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <SectionLabel>Effort</SectionLabel>
          <p className="mt-1 text-xs text-muted-foreground">
            How hard the agent thinks before acting. Higher costs more and takes longer.
            {/* Effort is agent-level only: Anthropic ignores it in a per-session
                override, so this is genuinely the only place it can be set. */}
          </p>
        </div>
        {readOnly ? (
          // `Segmented` has no disabled state, and adding one to a shared
          // component for this screen alone isn't worth it — a non-owner only
          // needs to read the value.
          <p className="text-sm">
            {state.effort ? EFFORT_LABELS[state.effort] : "Default"}
          </p>
        ) : (
          <Segmented
            value={state.effort ?? "default"}
            ariaLabel="Reasoning effort"
            options={[
              { value: "default", label: "Default" },
              ...(Object.keys(EFFORT_LABELS) as AgentEffort[]).map((effort) => ({
                value: effort,
                label: EFFORT_LABELS[effort],
              })),
            ]}
            onChange={(value) =>
              set("effort", value === "default" ? null : (value as AgentEffort))
            }
          />
        )}
      </div>

      {children}

      <GroundingToggle
        value={state.groundInBrain}
        onChange={(value) => set("groundInBrain", value)}
        disabled={readOnly}
      />

      {!readOnly && (
        <div className="flex items-center gap-3 border-t pt-5">
          <Button type="submit" disabled={saving || (Boolean(agent) && !isDirty)}>
            {saving ? "Saving…" : agent ? "Save changes" : "Create agent"}
          </Button>
          {agent && !isDirty && (
            <span className="text-xs text-muted-foreground">No unsaved changes</span>
          )}
        </div>
      )}
    </form>
  );
}
