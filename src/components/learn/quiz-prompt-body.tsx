import { renderProseMarkdown } from "@/lib/parse-prose-markdown";
import { cn } from "@/lib/utils";

/** Renders quiz question text with basic markdown (paragraphs, inline code, fenced code). */
export function QuizPromptBody({ prompt, className }: { prompt: string; className?: string }) {
  const segments = prompt.split(/(```[\s\S]*?```)/g).filter(Boolean);

  return (
    <div className={cn("text-base leading-relaxed text-foreground", className)}>
      {segments.map((segment, index) => {
        const fence = segment.match(/^```(?:[\w-]*)?\n?([\s\S]*?)```$/);
        if (fence) {
          return (
            <pre
              key={index}
              className="my-4 overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 font-mono text-sm leading-relaxed text-foreground"
            >
              <code>{fence[1]?.trimEnd()}</code>
            </pre>
          );
        }
        return (
          <div key={index} className="prose-p:my-3 prose-p:leading-relaxed">
            {renderProseMarkdown(segment.trim())}
          </div>
        );
      })}
    </div>
  );
}
