"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the input stays selectable.
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={value}
        onFocus={(event) => event.target.select()}
        className="h-9 w-full min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 font-mono text-xs text-neutral-700 outline-none focus:border-indigo-300"
      />
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
