import { api } from "@/lib/api";

import type { CompanyForm } from "../types";
import {
  CreateWorkspaceResultSchema,
  OnboardingResultSchema,
  SweepSchema,
  toTeamSize,
  toUseCase,
  type CreateWorkspaceResult,
  type OnboardingResult,
  type OnboardingStepValue,
  type Sweep,
  type TeamSize,
  type TimeRange,
  type UseCase,
} from "./onboarding.schemas";

/** `POST /workspaces` body. Sent to a `CamelRequestModel` → camelCase. */
export interface CreateWorkspaceInput {
  companyName: string;
  teamSize: TeamSize;
  primaryUseCase: UseCase;
}

/**
 * `PATCH /workspaces/{id}/onboarding` body. Only `step` is required; the rest
 * are the whole-step payload the wizard may include. `connectedProviders`,
 * `timeRange`, and `channels` are accepted but NOT persisted by this endpoint
 * (source/channel selection is owned by the Sources API) — they're sent for
 * contract completeness only.
 */
export interface SaveStepInput {
  step: OnboardingStepValue;
  companyName?: string;
  teamSize?: TeamSize;
  primaryUseCase?: UseCase;
  connectedProviders?: string[];
  timeRange?: TimeRange;
  channels?: Record<string, string[]>;
}

/**
 * The company form as a `POST /workspaces` body. The wizard's display strings
 * ("11–50 people") become the backend's enums here and nowhere else, so callers
 * never need `toTeamSize` / `toUseCase` themselves.
 */
export function toWorkspaceInput(company: CompanyForm): CreateWorkspaceInput {
  return {
    companyName: company.company.trim(),
    teamSize: toTeamSize(company.size),
    primaryUseCase: toUseCase(company.useCase),
  };
}

/** The same company answers as the `company` onboarding-progress step. */
export function toCompanyStep(company: CompanyForm): SaveStepInput {
  return { step: "company", ...toWorkspaceInput(company) };
}

/**
 * Onboarding endpoint functions.
 *  - `createWorkspace` runs with the signup token (no workspace yet) and returns
 *    a fresh access token the caller must adopt before any workspace-scoped call.
 *  - `saveStep` / sweeps require the workspace-scoped token and an admin role.
 */
export const onboardingApi = {
  createWorkspace: (input: CreateWorkspaceInput): Promise<CreateWorkspaceResult> =>
    api.post("/workspaces", CreateWorkspaceResultSchema, input),

  saveStep: (workspaceId: string, input: SaveStepInput): Promise<OnboardingResult> =>
    api.patch(`/workspaces/${workspaceId}/onboarding`, OnboardingResultSchema, input),

  /** Kick off the onboarding sweep. Idempotent server-side (202 new / 200 existing). */
  startSweep: (): Promise<Sweep> => api.post("/sweeps", SweepSchema),

  getSweep: (sweepId: string): Promise<Sweep> =>
    api.get(`/sweeps/${sweepId}`, SweepSchema),
};

/** Query keys for onboarding-owned server state (the sweep poll). */
export const onboardingKeys = {
  sweep: (workspaceId: string, sweepId: string) =>
    ["sweep", workspaceId, sweepId] as const,
};
