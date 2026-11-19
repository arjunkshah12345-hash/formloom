export const RANGES = { all: "All time", "30d": "Last 30 days", "7d": "Last 7 days", "24h": "Last 24 hours" } as const;
export type RangeKey = keyof typeof RANGES;

export function rangeSince(key: string | undefined): { key: RangeKey; since: number } {
  const k = (key && key in RANGES ? key : "all") as RangeKey;
  const day = 864e5;
  const since = k === "7d" ? Date.now() - 7 * day : k === "30d" ? Date.now() - 30 * day : k === "24h" ? Date.now() - day : 0;
  return { key: k, since };
}
