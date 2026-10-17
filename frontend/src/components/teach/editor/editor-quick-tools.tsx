"use client";

import { Popover } from "@base-ui/react/popover";
import { MoreHorizontal } from "lucide-react";
import { insertMarkdown$, usePublisher, ListsToggle, InsertImage, InsertCodeBlock, InsertTable, InsertThematicBreak } from "@mdxeditor/editor";
import { Button } from "@/components/ui/button";
import { useQuizEnabled } from "./chapter-block-configs";
import { createContentTemplate, type ContentTemplateId } from "./content-templates";

export function EditorQuickInsert() {
  const quiz = useQuizEnabled();
  const insert = usePublisher(insertMarkdown$);
  const items: Array<{ id: ContentTemplateId; label: string }> = quiz
    ? [{ id: "quiz", label: "Quiz" }, { id: "open-question", label: "Open question" }]
    : [{ id: "lesson-outline", label: "Lesson starter" }, { id: "callout", label: "Callout" }];
  return <div className="flex items-center gap-1" aria-label="Quick insert">
    {items.map(item => <Button key={item.id} type="button" size="sm" variant="ghost" onMouseDown={event => event.preventDefault()} onClick={() => insert(createContentTemplate(item.id))}>{item.label}</Button>)}
  </div>;
}

export function EditorMoreTools() {
  return <Popover.Root>
    <Popover.Trigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="More formatting tools" />}><MoreHorizontal className="size-4" /></Popover.Trigger>
    <Popover.Portal><Popover.Positioner sideOffset={8} className="z-50"><Popover.Popup className="buildment-editor rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl">
      <Popover.Title className="mb-2 text-xs font-medium text-muted-foreground">Lists and media</Popover.Title>
      <div className="flex flex-wrap items-center gap-1"><ListsToggle options={["bullet", "number"]} /><InsertImage /><InsertCodeBlock /><InsertTable /><InsertThematicBreak /></div>
    </Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>;
}
