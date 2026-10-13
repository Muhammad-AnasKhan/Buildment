import type { ReactNode } from "react";

/** Lightweight inline markdown for prose children (bold, italic, inline code). */
export function parseInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] text-neutral-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/** Render MDX children or plain-text markdown paragraphs. */
export function renderProseMarkdown(children: ReactNode): ReactNode {
  if (typeof children === "string") {
    const paragraphs = children.split(/\n\n+/).filter((p) => p.trim());
    return paragraphs.map((para, i) => (
      <p key={i} className="my-2">
        {parseInlineMarkdown(para.trim())}
      </p>
    ));
  }
  return children;
}
