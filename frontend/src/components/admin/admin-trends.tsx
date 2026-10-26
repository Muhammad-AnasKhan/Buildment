import Link from "next/link";
import type { AdminMetricPoint, AdminMetricsView } from "@/shared/api/admin";
import { cn } from "@/lib/utils";
import { AdminPanel, AdminPageHeader, AdminSection } from "@/components/admin/admin-ui";

// Trends live on their own page: one full-width panel per metric, each with its
// own Bars/Line switch in the panel header. Charts are server-rendered SVG — no
// chart library, no client JS — and range, metric, and per-chart type are URL state.

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
] as const;

export const TREND_CHART_TYPES = ["bars", "line"] as const;
export type TrendChartType = (typeof TREND_CHART_TYPES)[number];

export const TREND_METRIC_KEYS = ["signups", "enrollments", "activeLearners"] as const;
export type TrendMetricKey = (typeof TREND_METRIC_KEYS)[number];

export type TrendCharts = Record<TrendMetricKey, TrendChartType>;

const METRICS: Array<{
  key: TrendMetricKey;
  label: string;
  description: string;
  pick: (point: AdminMetricPoint) => number;
}> = [
  {
    key: "signups",
    label: "Signups",
    description: "New accounts created each UTC day.",
    pick: (point) => point.signups,
  },
  {
    key: "enrollments",
    label: "Enrollments",
    description: "Learners joining a course each UTC day (direct and assigned).",
    pick: (point) => point.enrollments,
  },
  {
    key: "activeLearners",
    label: "Active learners",
    description: "Distinct learners with study time recorded on a given day.",
    pick: (point) => point.activeLearners,
  },
];

const CHART_HEIGHT = 28;
const CHART_TOP = 1;

function TrendChart({
  points,
  type,
  label,
  description,
  typeHref,
}: {
  points: Array<{ date: string; value: number }>;
  type: TrendChartType;
  label: string;
  description: string;
  typeHref: (next: TrendChartType) => string;
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const step = 100 / points.length;
  const yFor = (value: number) => CHART_TOP + CHART_HEIGHT - (value / max) * CHART_HEIGHT;

  const coords = points.map((point, index) => [index * step + step / 2, yFor(point.value)] as const);
  const linePath = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

  return (
    <AdminPanel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{label}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{total}</span> total · peak {max}
          </p>
          <Toggle
            options={[
              { value: "bars", label: "Bars" },
              { value: "line", label: "Line" },
            ]}
            value={type}
            hrefFor={typeHref}
            size="xs"
          />
        </div>
      </div>

      <svg
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label} (${type === "bars" ? "bar" : "line"} chart): ${total} total over ${points.length} days, daily peak ${max}`}
        className="mt-5 h-44 w-full text-foreground"
      >
        {type === "bars"
          ? points.map((point, index) => (
              <rect
                key={point.date}
                x={index * step}
                y={yFor(point.value)}
                width={Math.max(step - 0.3, 0.15)}
                height={Math.max(30 - yFor(point.value), point.value > 0 ? 0.5 : 0)}
                className="fill-current opacity-70"
              />
            ))
          : null}

        {type === "line" && linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            // The viewBox is stretched to fill the panel, so keep the stroke even.
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        {/* Invisible per-day hit areas so both chart types show values on hover. */}
        {points.map((point, index) => (
          <rect key={point.date} x={index * step} y={0} width={step} height={30} fill="transparent">
            <title>{`${point.date}: ${point.value}`}</title>
          </rect>
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{points[0]?.date}</span>
        <span>peak {max}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </AdminPanel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Toggle<T extends string>({
  options,
  value,
  hrefFor,
  size = "sm",
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  hrefFor: (next: T) => string;
  size?: "sm" | "xs";
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const current = value === option.value;
        return (
          <Link
            key={option.value}
            href={hrefFor(option.value)}
            // Keep the reader where they are when only the view changes.
            scroll={false}
            aria-current={current ? "true" : undefined}
            className={cn(
              "inline-flex items-center rounded-lg border font-medium transition-colors",
              size === "xs" ? "h-6 px-2 text-[11px]" : "h-7 px-2.5 text-xs",
              current
                ? "border-transparent bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AdminTrends({
  metrics,
  range,
  metric,
  charts,
}: {
  metrics: AdminMetricsView;
  range: string;
  metric: string;
  charts: TrendCharts;
}) {
  const selected = METRICS.find((entry) => entry.key === metric) ?? null;
  const visible = selected ? [selected] : METRICS;
  const days = metrics.rangeDays;

  const href = (next: { range?: string; metric?: string; chart?: { key: TrendMetricKey; value: TrendChartType } }) => {
    const params = new URLSearchParams({ range: next.range ?? range });
    const nextMetric = next.metric ?? selected?.key ?? "all";
    if (nextMetric !== "all") params.set("metric", nextMetric);

    // Only non-default (line) selections appear in the URL.
    const nextCharts: TrendCharts = { ...charts };
    if (next.chart) nextCharts[next.chart.key] = next.chart.value;
    for (const key of TREND_METRIC_KEYS) {
      if (nextCharts[key] === "line") params.set(key, "line");
    }

    return `/admin/trends?${params.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Platform"
        title="Trends"
        description="Daily platform activity in UTC. Study time is credited while a chapter is open."
      />

      <div className="mt-6">
        <Toggle
          options={RANGES}
          value={range as (typeof RANGES)[number]["value"]}
          hrefFor={(next) => href({ range: next })}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={`New accounts (${days}d)`} value={String(metrics.totals.newUsers)} />
        <Stat label={`New enrollments (${days}d)`} value={String(metrics.totals.newEnrollments)} />
        <Stat label={`Active learners (${days}d)`} value={String(metrics.totals.activeLearners)} />
        <Stat label={`Study hours (${days}d)`} value={(metrics.totals.studySeconds / 3600).toFixed(1)} />
      </div>

      <AdminSection title="Daily charts" description="Each chart has its own Bars/Line switch.">
        <div className="mb-4">
          <Toggle
            options={[{ value: "all", label: "All metrics" }, ...METRICS.map((m) => ({ value: m.key, label: m.label }))]}
            value={selected?.key ?? "all"}
            hrefFor={(next) => href({ metric: next })}
          />
        </div>

        <div className="space-y-4">
          {visible.map((entry) => (
            <TrendChart
              key={entry.key}
              type={charts[entry.key]}
              label={`${entry.label} / day`}
              description={entry.description}
              typeHref={(next) => href({ chart: { key: entry.key, value: next } })}
              points={metrics.series.map((point) => ({ date: point.date, value: entry.pick(point) }))}
            />
          ))}
        </div>
      </AdminSection>
    </div>
  );
}
