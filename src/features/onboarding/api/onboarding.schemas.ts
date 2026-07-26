import { z } from "zod";

// Imported from the module, not the `@/lib/api` barrel, so this stays a pure
// schema file free of the client's `import.meta.env` side effects.
import { IsoDateTimeSchema } from "@/lib/api/schemas";
import { WorkspaceSummarySchema } from "@/features/auth/api/auth.schemas";

/**
 * Zod schemas + request mappers for the onboarding wire contract:
 *  - `POST /workspaces`                    create the workspace
 *  - `PATCH /workspaces/{id}/onboarding`   persist step progress
 *  - `POST /sweeps` / `GET /sweeps/{id}`   build-the-brain progress
 *
 * Responses are camelCase. Request bodies go to `CamelRequestModel`s, which
 * accept camelCase and reject unknown keys (`extra="forbid"`), so the request
 * builders below spell fields in camelCase deliberately.
 */

// ── request enums (the backend Literals) ────────────────────────────────────
export const TeamSizeSchema = z.enum(["1-10", "11-50", "51-200", "200+"]);
export type TeamSize = z.infer<typeof TeamSizeSchema>;

export const UseCaseSchema = z.enum(["support", "ops", "eng", "agents"]);
export type UseCase = z.infer<typeof UseCaseSchema>;

export const TimeRangeSchema = z.enum(["30d", "90d", "6mo", "all"]);
export type TimeRange = z.infer<typeof TimeRangeSchema>;

export const OnboardingStepSchema = z.enum([
  "company",
  "connect",
  "configure",
  "build",
  "done",
]);
export type OnboardingStepValue = z.infer<typeof OnboardingStepSchema>;

// ── display → wire mappers ──────────────────────────────────────────────────
// The wizard fixtures render human strings ("51–200", "90 days"); the backend
// wants its Literals. These normalize at the boundary and fall back to a safe
// default rather than sending an invalid value that would 422.

/** "1–10" / "51–200" / "200+" → "1-10" / "51-200" / "200+". */
export function toTeamSize(display: string): TeamSize {
  const normalized = display.replace(/[–—]/g, "-").replace(/\s/g, "");
  return TeamSizeSchema.catch("11-50").parse(normalized);
}

/** The wizard's use-case ids already match the backend Literal; validate defensively. */
export function toUseCase(value: string): UseCase {
  return UseCaseSchema.catch("support").parse(value);
}

/** "90 days" / "6 months" / "All time" → "90d" / "6mo" / "all". */
export function toTimeRange(display: string): TimeRange {
  const map: Record<string, TimeRange> = {
    "30 days": "30d",
    "90 days": "90d",
    "6 months": "6mo",
    "All time": "all",
  };
  return map[display] ?? "90d";
}

// ── responses ───────────────────────────────────────────────────────────────
export { WorkspaceSummarySchema };
export type { WorkspaceSummary } from "@/features/auth/api/auth.schemas";

/** `POST /workspaces` → the created workspace + a token scoped to it. */
export const CreateWorkspaceResultSchema = z.object({
  workspace: WorkspaceSummarySchema,
  accessToken: z.string(),
});
export type CreateWorkspaceResult = z.infer<typeof CreateWorkspaceResultSchema>;

/** `PATCH /workspaces/{id}/onboarding` → progress ack. */
export const OnboardingResultSchema = z.object({
  status: z.string(),
  nextStep: z.string(),
});
export type OnboardingResult = z.infer<typeof OnboardingResultSchema>;

/** Per-provider sweep progress; the map the "Building your brain…" screen reads. */
export const SweepProgressEntrySchema = z.object({
  status: z.string(),
  inserted: z.number().nullish(),
  error: z.string().nullish(),
});

export const SweepSchema = z.object({
  id: z.string(),
  status: z.string(),
  // A provider entry we can't parse must not blank the screen — degrade to {}.
  progress: z.record(z.string(), SweepProgressEntrySchema).catch({}),
  skillsCreated: z.number().default(0),
  skillsQueued: z.number().default(0),
  startedAt: IsoDateTimeSchema,
  completedAt: IsoDateTimeSchema.nullable(),
});
export type Sweep = z.infer<typeof SweepSchema>;

/**
 * `GET /sweeps/active` → the in-flight sweep for this workspace, or `null` when
 * none is running. The whole point of the endpoint is that the client never has
 * to persist a sweep id: a reload re-discovers it here.
 */
export const ActiveSweepSchema = SweepSchema.nullable();
export type ActiveSweep = z.infer<typeof ActiveSweepSchema>;

/** Sweep-level terminal states. Anything else means "keep polling". */
const TERMINAL_SWEEP_STATES = new Set(["completed", "failed"]);
export function isSweepTerminal(sweep: Sweep): boolean {
  return TERMINAL_SWEEP_STATES.has(sweep.status) || sweep.completedAt !== null;
}

/** One provider's row in the sweep progress map, flattened for rendering. */
export type SweepProviderProgress = {
  provider: string;
  status: string;
  inserted: number;
  /** Only ever set on a failed provider. */
  error: string | null;
};

/**
 * The `progress` map as a list.
 *
 * `progress` is keyed by **provider**, not by connection — two connected Drive
 * accounts collapse into one `google_drive` entry with summed counts — so these
 * rows deliberately don't line up one-to-one with `GET /sources`.
 */
export function sweepProviders(sweep: Sweep): SweepProviderProgress[] {
  return Object.entries(sweep.progress).map(([provider, entry]) => ({
    provider,
    status: entry.status,
    inserted: entry.inserted ?? 0,
    error: entry.error ?? null,
  }));
}

/**
 * Providers that failed inside the sweep.
 *
 * A sweep only reports `status: "failed"` when *every* attempted source failed,
 * so a `completed` sweep routinely carries individual failures. They have to be
 * read out of `progress` or they're invisible.
 */
export function sweepFailures(sweep: Sweep): SweepProviderProgress[] {
  return sweepProviders(sweep).filter((entry) => entry.status === "failed");
}
