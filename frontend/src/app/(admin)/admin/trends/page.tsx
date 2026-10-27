import type { AdminMetricsView } from "@/shared/api/admin";
import { serverApiFetch } from "@/lib/api-server";
import {
  AdminTrends,
  TREND_CHART_TYPES,
  TREND_METRIC_KEYS,
  type TrendCharts,
} from "@/components/admin/admin-trends";

const RANGES = ["7", "30", "90"] as const;

export default async function AdminTrendsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const range = RANGES.find((value) => value === params.range) ?? "30";
  const metric = TREND_METRIC_KEYS.find((value) => value === params.metric) ?? "all";

  // One chart type per metric; each param falls back to bars.
  const charts = Object.fromEntries(
    TREND_METRIC_KEYS.map((key) => [
      key,
      TREND_CHART_TYPES.find((value) => value === params[key]) ?? "bars",
    ])
  ) as TrendCharts;

  const metrics = await serverApiFetch<AdminMetricsView>(`/api/v1/admin/metrics?range=${range}`);

  return <AdminTrends metrics={metrics} range={range} metric={metric} charts={charts} />;
}
