import type { EvaluationReflection } from "./types";

export function LearnerReflections({ items }: { items: EvaluationReflection[] }) {
  return (
    <section id="reflections" className="rounded-2xl border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Learning log</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Checklist ticks and learning-log answers saved on this learner&apos;s account.
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No reflections saved yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <article key={item.chapterId} className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">{item.moduleTitle}</p>
              <h3 className="mt-1 text-sm font-semibold">{item.chapterTitle}</h3>
              {item.checklist.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {item.checklist.map((entry) => (
                    <li key={entry.id} className="text-muted-foreground">
                      {entry.checked ? "Checked" : "Unchecked"} · {entry.id}
                    </li>
                  ))}
                </ul>
              ) : null}
              {item.answers.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {item.answers.map((answer) => (
                    <div key={answer.id}>
                      <p className="text-xs font-medium text-muted-foreground">{answer.id}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{answer.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
