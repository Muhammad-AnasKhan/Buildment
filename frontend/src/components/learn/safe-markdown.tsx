import { parseMarkdown, type Inline } from "@/lib/safe-markdown";

function Inlines({ inlines }: { inlines: Inline[] }) {
  return inlines.map((inline, index) => {
    if (inline.kind === "bold") return <strong key={index} className="font-semibold">{inline.text}</strong>;
    if (inline.kind === "code") return <code key={index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{inline.text}</code>;
    return inline.text;
  });
}

/** A tutor answer as simple Markdown. Only text nodes are ever rendered, never HTML. */
export function SafeMarkdown({ source }: { source: string }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-foreground">
      {parseMarkdown(source).map((block, index) => {
        if (block.kind === "paragraph") return <p key={index}><Inlines inlines={block.inlines} /></p>;
        if (block.kind === "code") {
          return <pre key={index} className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-[13px] leading-snug"><code>{block.text}</code></pre>;
        }
        const List = block.ordered ? "ol" : "ul";
        return (
          <List key={index} className={block.ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}>
            {block.items.map((item, itemIndex) => <li key={itemIndex}><Inlines inlines={item} /></li>)}
          </List>
        );
      })}
    </div>
  );
}
