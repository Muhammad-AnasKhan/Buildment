import { BookOpen, Clock, Layers, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
};

export function CourseStatsRow({
  moduleCount,
  chapterCount,
  estimatedHours,
  checkpointCount,
}: {
  moduleCount: number;
  chapterCount: number;
  estimatedHours: number | null;
  checkpointCount: number;
}) {
  const stats: Stat[] = [
    { icon: Layers, label: "Modules", value: String(moduleCount), hint: "Full build roadmap" },
    { icon: BookOpen, label: "Lessons", value: String(chapterCount), hint: "Bite-sized steps" },
    ...(estimatedHours
      ? [
          {
            icon: Clock,
            label: "Est. hours",
            value: `${estimatedHours}h`,
            hint: "Hands-on practice time",
          },
        ]
      : []),
    {
      icon: Sparkles,
      label: "Checkpoints",
      value: String(checkpointCount),
      hint: "Answer before you continue",
      accent: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "rounded-xl border p-4",
            stat.accent ? "border-indigo-100 bg-indigo-50/60" : "border-neutral-200 bg-white"
          )}
        >
          <stat.icon
            className={cn("size-4", stat.accent ? "text-indigo-600" : "text-neutral-400")}
            aria-hidden
          />
          <p
            className={cn(
              "mt-2 text-xl font-bold tracking-tight",
              stat.accent ? "text-indigo-950" : "text-neutral-950"
            )}
          >
            {stat.value}
          </p>
          <p className={cn("text-xs", stat.accent ? "text-indigo-700/80" : "text-neutral-500")}>
            {stat.hint}
          </p>
        </div>
      ))}
    </div>
  );
}
