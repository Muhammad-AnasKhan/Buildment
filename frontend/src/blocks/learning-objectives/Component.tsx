import { Target } from "lucide-react";
import { fetchBlockState } from "@/blocks/block-state";
import { PendingBlockCard } from "@/components/learn/pending-block-card";
import { readerCardLg, readerEyebrow } from "@/components/learn/reader-theme";

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
    const state = await fetchBlockState(id, "LEARNING_OBJECTIVES");
    if (state) list = state.config.objectives;
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
    <section className={`not-prose my-8 ${readerCardLg}`} aria-labelledby={id ? `learning-objectives-${id}` : undefined} data-learning-objectives>
      <header className="border-b border-border bg-muted/25 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" aria-hidden />
          <p className={readerEyebrow}>Learning objectives</p>
        </div>
        <h3 id={id ? `learning-objectives-${id}` : undefined} className="mt-2 text-xl font-semibold leading-tight tracking-tight text-foreground">What you&apos;ll learn</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">By the end of this chapter, you&apos;ll be able to:</p>
      </header>
      <ol className="divide-y divide-border px-5 sm:px-6">
        {list.map((objective, index) => (
          <li key={index} className="flex items-start gap-4 py-4 first:pt-5 last:pb-5">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 font-mono text-xs font-semibold tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 pt-0.5 text-[15px] leading-relaxed text-foreground">
              {String(objective).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
