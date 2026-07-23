import { AppIcon, PageHeader, type AppIconName } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api";

import { NewSkillDialog } from "../components/NewSkillDialog";
import { SkillsTable } from "../components/SkillsTable";
import { useExportSkills } from "../hooks/useExportSkills";
import { useSkillsSearch } from "../hooks/useSkillsSearch";

/** Skills registry screen. Backed by `/skills/search` — the backend has no
 * list-all surface, so the registry is search-driven. */
export function SkillsPage() {
  const { query, setQuery, hasQuery, filtered, isPending, isError, error } =
    useSkillsSearch();
  const { exportBundle, isExporting } = useExportSkills();

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        label="Registry · MCP-ready"
        title="Skills"
        sub="Executable capabilities your agents call. Versioned, with full source lineage."
        right={
          <>
            <div className="relative">
              <AppIcon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search skills…"
                aria-label="Search skills"
                className="w-[200px] pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportBundle}
              disabled={isExporting}
            >
              <AppIcon name="externalLink" size={15} />
              {isExporting ? "Exporting…" : "Export"}
            </Button>
            <NewSkillDialog
              trigger={
                <Button variant="solid" size="sm">
                  <AppIcon name="plus" size={15} />
                  New skill
                </Button>
              }
            />
          </>
        }
      />

      <div className="mx-auto max-w-[1100px] px-6 pb-14 pt-6 md:px-10">
        {!hasQuery ? (
          <EmptyState
            icon="search"
            title="Search the registry"
            body="Type a query to semantically search your published skills."
          />
        ) : isPending ? (
          <EmptyState icon="skills" title="Searching…" body="Finding the closest skills." />
        ) : isError ? (
          <EmptyState
            icon="warning"
            title="Couldn't search skills"
            body={isApiError(error) ? error.message : "Something went wrong. Try again."}
          />
        ) : (
          <SkillsTable skills={filtered} />
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: AppIconName;
  title: string;
  body: string;
}

/** Centered idle / loading / error placeholder for the search-driven registry. */
function EmptyState({ icon, title, body }: EmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-xl border border-line-soft bg-paper/40 px-6 py-20 text-center">
      <span className="mb-3 grid size-11 place-items-center rounded-xl bg-cream text-ink-3">
        <AppIcon name={icon} size={20} />
      </span>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-[360px] text-[13px] text-ink-3">{body}</p>
    </div>
  );
}
