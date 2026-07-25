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

// SOURCE_ACTIVITY still backs the "Reading now" ingestion animation, which is a
// deliberate simulation (no backend feed). Delete it if that ticker is removed.
export { SOURCE_ACTIVITY } from "./data/source-activity";
export type { SourceActivity, SourceActivityMap } from "./types";
