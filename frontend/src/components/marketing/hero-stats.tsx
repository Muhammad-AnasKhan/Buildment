export type HeroStat = { value: number; label: string; suffix?: string };

/** Catalog totals stay useful before hydration and with JavaScript off. */
export function HeroStats({ stats }: { stats: HeroStat[] }) {
  if (stats.length === 0) return null;
  return (
    <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-5">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse gap-1">
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          <dd className="font-mono text-2xl tabular-nums tracking-tight">
            {stat.value}{stat.suffix}
          </dd>
        </div>
      ))}
    </dl>
  );
}

