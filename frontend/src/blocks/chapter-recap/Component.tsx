import { prisma } from "@/server/db";
import { ChapterRecapConfigSchema } from "./schema";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function ChapterRecapComponent({
  id,
  points,
  items,
}: {
  id?: string;
  points?: string[];
  items?: string[];
}) {
  let list = points ?? items;

  if ((!list || !Array.isArray(list) || list.length === 0) && id) {
    try {
      const block = await prisma.block.findUnique({ where: { id } });
      const parsed = block ? ChapterRecapConfigSchema.safeParse(block.config) : null;
      if (parsed?.success) {
        list = parsed.data.points;
      }
    } catch {
      // Ignore DB lookup error in preview / pending states
    }
  }

  if (!list || !Array.isArray(list) || list.length === 0) {
    if (id) {
      return (
        <PendingBlockCard
          typeLabel="Chapter Recap"
          title="Key ideas in progress"
          description="Summary takeaways for this chapter are currently being finalized."
          blockId={id}
        />
      );
    }
    return null;
  }

  return (
    <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-400/25 dark:bg-emerald-500/10">
      <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Key ideas from this chapter</h4>
      <ul className="mt-3 space-y-2">
        {list.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
            <svg className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
