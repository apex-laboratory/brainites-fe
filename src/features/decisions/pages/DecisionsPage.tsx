import { PageHeader, Segmented } from "@/components/shared";

import { DecisionDetail } from "../components/DecisionDetail";
import { DecisionRow } from "../components/DecisionRow";
import { useDecisionFilters } from "../hooks/useDecisionFilters";
import { useSelectedDecision } from "../hooks/useSelectedDecision";

/** Decisions master–detail screen (prototype `DecisionsPage`). */
export function DecisionsPage() {
  const { filter, setFilter, filtered, options } = useDecisionFilters();
  const { selectedId, setSelectedId, selected } = useSelectedDecision(filtered);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        label="Company logic · 184 decisions"
        title="Decisions"
        sub="The calls your team has made, extracted and made executable."
        right={
          <Segmented
            value={filter}
            options={options}
            onChange={setFilter}
            ariaLabel="Filter decisions by status"
          />
        }
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="shrink-0 overflow-y-auto border-line py-2 max-lg:max-h-72 max-lg:border-b lg:w-[340px] lg:border-r">
          {filtered.map((decision) => (
            <DecisionRow
              key={decision.id}
              decision={decision}
              active={decision.id === selectedId}
              onClick={() => setSelectedId(decision.id)}
            />
          ))}
        </div>

        {selected && <DecisionDetail key={selected.id} decision={selected} />}
      </div>
    </div>
  );
}
