"use client";

import { useEffect, useRef, useState } from "react";
import { HandHelping, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpThreadDetail } from "./help-thread-detail";
import type { HelpThreadView } from "./help-types";

export function AskHelpDialog({
  courseId,
  chapterId,
  chapterTitle,
  viewerId,
  thread,
}: {
  courseId: string;
  courseSlug: string;
  chapterId: string;
  chapterTitle: string;
  viewerId: string;
  thread: HelpThreadView | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const isOpen = thread?.status === "OPEN";
  const lastMessage = thread?.messages[thread.messages.length - 1];
  const mentorReplied = lastMessage?.authorRole === "MENTOR" && isOpen;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    setOpen(false);
  }

  let triggerLabel = "Ask for help";
  if (mentorReplied) triggerLabel = "Mentor replied";
  else if (isOpen) triggerLabel = "Help note sent";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors sm:px-3",
          mentorReplied
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            : isOpen
              ? "border-border bg-muted text-foreground hover:bg-muted/80"
              : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <HandHelping className="size-3.5 shrink-0 opacity-80" aria-hidden />
        <span className="hidden sm:inline">{triggerLabel}</span>
        <span className="sm:hidden">Help</span>
      </button>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-neutral-950/40 open:flex open:items-center open:justify-center open:p-4"
        aria-labelledby="ask-help-title"
      >
        <div className="flex max-h-[min(32rem,90dvh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
            <div className="min-w-0">
              <h2 id="ask-help-title" className="text-base font-semibold text-neutral-950">
                Send a help note
              </h2>
              <p className="mt-0.5 truncate text-sm text-neutral-500">{chapterTitle}</p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <HelpThreadDetail
            variant="mentee"
            layout="modal"
            threadId={thread?.id ?? null}
            status={thread?.status ?? null}
            messages={thread?.messages ?? []}
            viewerId={viewerId}
            courseId={courseId}
            chapterId={chapterId}
            footerLink={{
              href: "/my-questions",
              label: "All my notes",
              onNavigate: close,
            }}
          />
        </div>
      </dialog>
    </>
  );
}
