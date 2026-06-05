export type UsageMetric = {
  label: string;
  value: string;
  spark: number[];
};

/** "This month" usage metrics from the prototype settings → usage tab. */
export const USAGE_METRICS: UsageMetric[] = [
  { label: "Brain queries", value: "18.4k", spark: [12, 14, 13, 16, 18, 17, 18] },
  { label: "MCP calls", value: "42.7k", spark: [30, 34, 38, 36, 40, 43, 43] },
  { label: "Skills served", value: "37", spark: [28, 30, 32, 34, 35, 36, 37] },
];
