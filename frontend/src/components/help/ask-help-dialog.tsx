"use client";

import { useEffect, useRef, useState } from "react";
import { HandHelping, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpThreadDetail } from "./help-thread-detail";
import type { HelpThreadView } from "@/shared/api/help";
import { helpUiCopy as copy } from "@/shared/lib/help-ui-copy";
import { useMascot } from "@/lib/engagement/use-mascot";

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

  // The mascot's "Ask a mentor" button opens this dialog.
  useMascot({ onAskHelp: () => setOpen(true) });

  function close() {
    setOpen(false);
  }

  let triggerLabel: string = copy.askQuestion;
  if (mentorReplied) triggerLabel = copy.mentorReplied;
  else if (isOpen) triggerLabel = copy.questionSent;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border-2 px-2.5 text-[15px] font-bold transition-colors outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow sm:px-4",
          mentorReplied
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            : isOpen
              ? "border-border bg-muted text-foreground hover:bg-muted/80"
              : "border-input bg-card text-foreground hover:border-primary"
        )}
      >
        <HandHelping className="size-5 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{triggerLabel}</span>
        <span className="sr-only sm:hidden">{copy.askQuestionShort}</span>
      </button>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-background/70 open:flex open:items-center open:justify-center open:p-4"
        aria-labelledby="ask-help-title"
      >
        <div className="flex max-h-[min(32rem,90dvh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground ">
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <h2 id="ask-help-title" className="text-base font-semibold text-foreground">
                {copy.dialogTitle}
              </h2>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{chapterTitle}</p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              label: copy.allQuestionsLink,
              onNavigate: close,
            }}
          />
        </div>
      </dialog>
    </>
  );
}
