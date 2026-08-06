"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

export function CodeBlockWrapper({
  filename,
  children,
}: {
  filename?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Try to extract text from children
    let text = "";
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === "string") return node;
      if (typeof node === "number") return String(node);
      if (!node) return "";
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (typeof node === "object" && "props" in node) {
        return extractText((node as { props: React.ReactNode }).props);
      }
      return "";
    };
    text = extractText(children);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="not-prose group relative my-6 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-sm">
      {filename ? (
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-2">
          <span className="text-xs font-medium text-neutral-400">{decodeURIComponent(filename)}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1.5 rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-200"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </button>
      )}
      <div className="overflow-x-auto p-4">{children}</div>
    </div>
  );
}
