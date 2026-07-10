export { SourcesPage } from "./pages/SourcesPage";
export { SourceCard, SourceActivityRow, SourceStatusLine } from "./components";
export {
  useSources,
  type SourceEntry,
  useSourceActivity,
  type SourceActivityEntry,
} from "./hooks";
export {
  sourcesApi,
  sourceKeys,
  type Source,
  type SourceChannel,
  type SourceProvider,
} from "./api";
export { describeSource, type SourcePresentation } from "./utils/status";

// The fixtures below still back the Overview screen and the "Reading now"
// simulation, neither of which is migrated yet (phase 5 of
// FE_BE_INTEGRATION_PLAN.md). Delete them along with those screens.
export { SOURCE_HEALTH } from "./data/source-health";
export { SOURCE_ACTIVITY } from "./data/source-activity";
export type {
  SourceHealth,
  SourceHealthMap,
  SourceActivity,
  SourceActivityMap,
} from "./types";
