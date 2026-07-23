import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useWorkspaceId } from "@/app/providers/AuthProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { SOURCES } from "@/constants/sources";
import type { SourceId } from "@/types/common";

import { skillKeys, skillsApi, type SkillSearchResult } from "../api";
import type { Skill } from "../types";

/** Map a backend `sourceAuthority` string onto a known `SourceId`, else drop it. */
function asSource(authority: string | null | undefined): SourceId[] {
  return authority && authority in SOURCES ? [authority as SourceId] : [];
}

/**
 * Map a search hit onto the table's view model. The backend search surface
 * carries name/version/source/similarity but not the prototype's usage metrics
 * (calls, sparkline, updated) — those stay `undefined` and the table renders a
 * placeholder. Search only returns published skills, so `status` is `stable`.
 */
function mapSkill(r: SkillSearchResult): Skill {
  return {
    id: r.id,
    name: r.name,
    v: r.version,
    src: asSource(r.sourceAuthority),
    status: "stable",
    similarity: r.similarity,
  };
}

/**
 * Owns the skills registry search against `/skills/search`. The backend has no
 * list-all endpoint, so the registry is search-driven: results load once the
 * (debounced) query is non-empty. Workspace-keyed so switching workspaces can't
 * serve stale hits.
 */
export function useSkillsSearch() {
  const workspaceId = useWorkspaceId();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 300);
  const hasQuery = debouncedQuery.length > 0;

  const params = { q: debouncedQuery, limit: 20 };
  const searchQuery = useQuery({
    queryKey: skillKeys.search(workspaceId, params),
    queryFn: () => skillsApi.search(params),
    enabled: hasQuery,
  });

  const filtered = useMemo<Skill[]>(
    () => (searchQuery.data ?? []).map(mapSkill),
    [searchQuery.data],
  );

  return {
    query,
    setQuery,
    hasQuery,
    filtered,
    isPending: hasQuery && searchQuery.isPending,
    isError: searchQuery.isError,
    error: searchQuery.error,
  };
}
