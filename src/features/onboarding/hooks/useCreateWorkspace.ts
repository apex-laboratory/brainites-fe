import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/app/providers/AuthProvider";

import { onboardingApi, toCompanyStep, toWorkspaceInput } from "../api";
import type { CompanyForm } from "../types";
import { useOnboardingProgress } from "./useOnboardingProgress";

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
  const saveProgress = useOnboardingProgress();

  return useMutation({
    mutationFn: async (company: CompanyForm) => {
      const result = await onboardingApi.createWorkspace(toWorkspaceInput(company));
      // Swap the token synchronously before any workspace-scoped call fires.
      activateWorkspace(result.workspace, result.accessToken);

      // Best-effort, never blocking the wizard. The id is explicit because the
      // workspace we just created hasn't reached the progress hook's closure yet.
      saveProgress(toCompanyStep(company), result.workspace.id);

      return result;
    },
  });
}
