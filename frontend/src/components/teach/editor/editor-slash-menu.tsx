"use client";

import { useEffect, useState } from "react";
import { insertMarkdown$, usePublisher } from "@mdxeditor/editor";
import {
  createContentTemplate,
  type ContentTemplateId,
} from "@/components/teach/editor/content-templates";

const SLASH_ITEMS: { id: ContentTemplateId; label: string }[] = [
  { id: "section", label: "Section" },
  { id: "callout", label: "Callout" },
  { id: "quiz", label: "Quiz" },
  { id: "checklist", label: "Checklist" },
  { id: "learning-log", label: "What you learned" },
  { id: "faq", label: "FAQ" },
  { id: "must-read", label: "Must read" },
  { id: "video", label: "Video" },
  { id: "compare", label: "Compare" },
];

/** Type `/` on an empty spot in the chapter editor to insert a block. */
export function EditorSlashMenu() {
  const insertMarkdown = usePublisher(insertMarkdown$);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState({ top: 120, left: 80 });

  useEffect(() => {
    let root: Element | null = null;
    let timer = 0;

    const onKeyDown = (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      if (keyEvent.key === "Escape") {
        setOpen(false);
        return;
      }
      if (keyEvent.key !== "/" || keyEvent.metaKey || keyEvent.ctrlKey || keyEvent.altKey) return;
      const selection = window.getSelection();
      const text = selection?.anchorNode?.textContent ?? "";
      const offset = selection?.anchorOffset ?? 0;
      const before = text.slice(0, offset);
      if (before !== "" && !/\s$/.test(before)) return;
      keyEvent.preventDefault();
      const rect =
        selection && selection.rangeCount > 0
          ? selection.getRangeAt(0).getBoundingClientRect()
          : null;
      setPosition({
        top: (rect?.bottom || 160) + 8,
        left: rect?.left || 80,
      });
      setQuery("");
      setOpen(true);
    };

    const attach = () => {
      const next = document.querySelector(".chapter-mdx-editor [contenteditable='true']");
      if (!next || next === root) return;
      root?.removeEventListener("keydown", onKeyDown);
      root = next;
      root.addEventListener("keydown", onKeyDown);
    };

    attach();
    timer = window.setInterval(attach, 500);
    return () => {
      window.clearInterval(timer);
      root?.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const items = SLASH_ITEMS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  return (
    <div
      className="fixed z-[70] w-64 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <input
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Insert a block"
        className="w-full border-b border-border bg-transparent px-3 py-2 text-sm outline-none"
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter" && items[0]) {
            insertMarkdown(createContentTemplate(items[0].id));
            setOpen(false);
          }
        }}
      />
      <ul className="max-h-64 overflow-y-auto p-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              onClick={() => {
                insertMarkdown(createContentTemplate(item.id));
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
