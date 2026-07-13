import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/app/providers/AuthProvider";

import {
  onboardingApi,
  toTeamSize,
  toUseCase,
  type CreateWorkspaceInput,
} from "../api";
import type { CompanyForm } from "../types";

/**
 * Create the workspace from the company-setup form. On success it adopts the
 * returned workspace-scoped access token (via `activateWorkspace`) so every
 * later onboarding call — and the whole dashboard — is workspace-scoped, then
 * best-effort records the "company" onboarding step.
 *
 * The mutation is NOT idempotent server-side (each call makes a workspace), so
 * the caller must guard against re-invoking it once a workspace exists.
 */
export function useCreateWorkspace() {
  const { activateWorkspace } = useAuth();

  return useMutation({
    mutationFn: async (company: CompanyForm) => {
      const input: CreateWorkspaceInput = {
        companyName: company.company.trim(),
        teamSize: toTeamSize(company.size),
        primaryUseCase: toUseCase(company.useCase),
      };

      const result = await onboardingApi.createWorkspace(input);
      // Swap the token synchronously before any workspace-scoped call fires.
      activateWorkspace(result.workspace, result.accessToken);

      // Progress persistence is best-effort — never block the wizard on it.
      void onboardingApi
        .saveStep(result.workspace.id, {
          step: "company",
          companyName: input.companyName,
          teamSize: input.teamSize,
          primaryUseCase: input.primaryUseCase,
        })
        .catch(() => {});

      return result;
    },
  });
}
