"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lexical, rootEditor$, insertMarkdown$, useCellValue, usePublisher } from "@mdxeditor/editor";
import { createContentTemplate, type ContentTemplateId } from "./content-templates";
import { useQuizEnabled } from "./chapter-block-configs";
import { INSERTABLE_CONTENT_ITEMS } from "./insert-content-menu";

/** Slash commands share the toolbar catalog and preserve Lexical's insertion point. */
export function EditorSlashMenu() {
  const quizEnabled = useQuizEnabled();
  const editor = useCellValue(rootEditor$);
  const insertMarkdown = usePublisher(insertMarkdown$);
  const listId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const commandRange = useRef<ReturnType<typeof lexical.$getSelection>>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const items = INSERTABLE_CONTENT_ITEMS.filter(item =>
    (quizEnabled ? ["quiz", "open-question", "predict", "code-exercise"].includes(item.id) : item.id !== "quiz") && `${item.label} ${item.description} ${item.id}`.toLowerCase().includes(query.toLowerCase().trim())
  );

  useEffect(() => {
    if (!editor) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      const target = event.target;
      const root = editor.getRootElement();
      if (!(target instanceof HTMLElement) || !root || target.closest("input, textarea, select, [contenteditable='false'], .cm-editor")) return;
      if (target.closest("[contenteditable='true']") !== root) return;
      const selection = window.getSelection();
      if (!selection?.isCollapsed || !selection.rangeCount || !root.contains(selection.anchorNode)) return;
      const range = selection.getRangeAt(0);
      const anchor = selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement;
      const line = anchor?.closest("p, h1, h2, h3, h4, h5, h6, li");
      // Check the entire block, not just the current text node: formatted text
      // can split one paragraph across several DOM nodes.
      if (!line || line.textContent !== "" || line.querySelector("img, [contenteditable='false']")) return;
      event.preventDefault();
      event.stopPropagation();
      const caret = range.getBoundingClientRect();
      const fallback = (selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement)?.getBoundingClientRect();
      const rect = caret.height ? caret : fallback ?? root.getBoundingClientRect();
      setPosition({
        top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 350)),
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 336)),
      });
      editor.update(() => {
        const cursor = lexical.$getSelection();
        if (!lexical.$isRangeSelection(cursor)) return;
        cursor.insertText("/");
        const inserted = lexical.$getSelection();
        if (!lexical.$isRangeSelection(inserted)) return;
        const command = inserted.clone();
        command.anchor.set(command.focus.key, command.focus.offset - 1, "text");
        commandRange.current = command;
      }, { discrete: true });
      setQuery("");
      setActive(0);
    };
    return editor.registerRootListener((root, previous) => {
      previous?.removeEventListener("keydown", onKeyDown, true);
      root?.addEventListener("keydown", onKeyDown, true);
    });
  }, [editor]);

  useEffect(() => {
    if (!position) return;
    const dismiss = (event: Event) => {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      setPosition(null);
    };
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [position]);

  useEffect(() => {
    panel.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setActive(0);
    // Keep the literal command in the document even while the picker has focus.
    editor?.update(() => {
      const command = commandRange.current;
      if (!lexical.$isRangeSelection(command)) return;
      lexical.$setSelection(command.clone());
      const selection = lexical.$getSelection();
      if (!lexical.$isRangeSelection(selection)) return;
      const text = "/" + value;
      selection.insertText(text);
      const inserted = lexical.$getSelection();
      if (!lexical.$isRangeSelection(inserted)) return;
      const next = inserted.clone();
      next.anchor.set(next.focus.key, next.focus.offset - text.length, "text");
      commandRange.current = next;
    }, { tag: lexical.SKIP_DOM_SELECTION_TAG });
  };

  const choose = (id: ContentTemplateId) => {
    if (id === "quiz" && !quizEnabled) return;
    setPosition(null);
    // Restore the saved editor selection before publishing the insertion.
    editor?.focus(() => {
      editor.update(() => {
        const command = commandRange.current;
        if (!lexical.$isRangeSelection(command)) return;
        lexical.$setSelection(command.clone());
        insertMarkdown(createContentTemplate(id));
        commandRange.current = null;
      });
    });
  };
  if (!position) return null;

  return createPortal(
    <div ref={panel} className="fixed z-[70] w-80 max-w-[calc(100vw-16px)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl" style={position}>
      <input
        autoFocus
        role="combobox"
        aria-label="Search blocks"
        aria-expanded={true}
        aria-controls={listId}
        aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
        value={query}
        onChange={event => updateQuery(event.target.value)}
        placeholder="Search blocks…"
        className="w-full border-b border-border bg-transparent px-3 py-3 text-sm outline-none"
        onKeyDown={event => {
          if (event.key === "Escape" || event.key === "Tab") {
            event.preventDefault();
            setPosition(null);
            editor?.focus();
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (items.length) setActive(index => (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length);
          } else if (event.key === "Enter") {
            event.preventDefault();
            if (items[active]) choose(items[active].id);
          }
        }}
      />
      <ul id={listId} role="listbox" aria-label="Available blocks" className="max-h-60 overflow-y-auto p-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          return <li key={item.id} id={`${listId}-${index}`} data-index={index} role="option" aria-selected={active === index}>
            <button type="button" tabIndex={-1} className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left ${active === index ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`} onMouseDown={event => event.preventDefault()} onClick={() => choose(item.id)}>
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span><span className="block text-sm font-medium">{item.label}</span><span className="block text-xs text-muted-foreground">{item.description}</span></span>
            </button>
          </li>;
        })}
      </ul>
      {!items.length && <p role="status" className="px-3 py-4 text-sm text-muted-foreground">No blocks found. Try another search.</p>}
      <p className="border-t px-3 py-2 text-xs text-muted-foreground">↑ ↓ to browse · Enter to insert · Esc to keep text</p>
    </div>,
    document.body
  );
}
