import { prisma } from "@/server/db";
import { LearningObjectivesConfigSchema } from "./schema";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function LearningObjectivesComponent({
  id,
  objectives,
  items,
}: {
  id?: string;
  objectives?: string[];
  items?: string[];
}) {
  let list = objectives ?? items;

  if ((!list || !Array.isArray(list) || list.length === 0) && id) {
    try {
      const block = await prisma.block.findUnique({ where: { id } });
      const parsed = block ? LearningObjectivesConfigSchema.safeParse(block.config) : null;
      if (parsed?.success) {
        list = parsed.data.objectives;
      }
    } catch {
      // Ignore DB lookup error in preview / pending states
    }
  }

  if (!list || !Array.isArray(list) || list.length === 0) {
    if (id) {
      return (
        <PendingBlockCard
          typeLabel="Learning Objectives"
          title="Objectives in preparation"
          description="The learning goals for this chapter are currently being finalized."
          blockId={id}
        />
      );
    }
    return null;
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-400/25 dark:bg-amber-500/10">
      <div className="flex items-center gap-2 border-b border-amber-200/60 bg-amber-50 px-5 py-3 dark:border-amber-400/20 dark:bg-amber-500/10">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-600 dark:text-amber-400">
          <path d="M8 1l2.5 5 5.5.8-4 3.9.9 5.3L8 12.5 3.1 16l.9-5.3-4-3.9 5.5-.8L8 1z" fill="currentColor" />
        </svg>
        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Learning objectives</h4>
      </div>
      <ul className="divide-y divide-amber-200/60 dark:divide-amber-400/15">
        {list.map((objective, i) => (
          <li key={i} className="flex items-start gap-3 px-5 py-3 text-sm text-foreground/85">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[11px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-100">
              {i + 1}
            </span>
            <span className="leading-relaxed">{objective}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
