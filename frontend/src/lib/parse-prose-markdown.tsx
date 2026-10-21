import type { ReactNode } from "react";
import { parseInlineMarkdown } from "@/lib/inline-markdown";

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
