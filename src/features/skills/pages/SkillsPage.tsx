import { AppIcon, PageHeader, StatStrip, type Stat } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SkillsTable } from "../components/SkillsTable";
import { useSkillsSearch } from "../hooks/useSkillsSearch";

const STATS: Stat[] = [
  { label: "Total skills", value: "37" },
  { label: "Stable", value: "31" },
  { label: "In review", value: "4" },
  { label: "Calls · 30d", value: "11.6k" },
];

/** Skills registry screen (prototype `SkillsPage`). */
export function SkillsPage() {
  const { query, setQuery, filtered } = useSkillsSearch();

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader
        label="Registry · 37 skills · MCP-ready"
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
            <Button variant="solid" size="sm">
              <AppIcon name="plus" size={15} />
              New skill
            </Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1100px] px-6 pb-14 pt-6 md:px-10">
        <StatStrip stats={STATS} className="mb-[18px]" />
        <SkillsTable skills={filtered} />
      </div>
    </div>
  );
}
