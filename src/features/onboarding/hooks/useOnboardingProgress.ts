import { useCallback } from "react";

import { useAuth } from "@/app/providers/AuthProvider";

import { onboardingApi, type SaveStepInput } from "../api";

/**
 * Fire-and-forget onboarding-progress recorder. Returns a `save(step)` that
 * PATCHes `/{workspaceId}/onboarding` without blocking navigation or surfacing
 * a toast — progress tracking is a convenience, not a gate. No-ops until a
 * workspace exists (i.e. before the company step creates one).
 *
 * The id may be passed explicitly for the one caller that records progress
 * *during* workspace creation, where this hook's own closure is a render behind.
 */
export function useOnboardingProgress() {
  const { workspaceId } = useAuth();

  return useCallback(
    (input: SaveStepInput, explicitWorkspaceId?: string) => {
      const id = explicitWorkspaceId ?? workspaceId;
      if (!id) return;
      void onboardingApi.saveStep(id, input).catch(() => {});
    },
    [workspaceId],
  );
}
