"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GraduationCap, HandHelping, MessagesSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpThreadDetail } from "./help-thread-detail";
import { ChatAvatar, ChatHeader, chatIconButton } from "./help-chat-ui";
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

  const status = !thread
    ? { label: "Start the conversation", tone: "info" as const }
    : thread.status === "RESOLVED"
      ? { label: "Resolved", tone: "ok" as const }
      : mentorReplied
        ? { label: "Mentor replied", tone: "info" as const }
        : { label: "Waiting for your mentor", tone: "waiting" as const };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border-2 px-2.5 text-[15px] font-bold transition-all outline-none hover:-translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow sm:px-4",
          mentorReplied
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            : isOpen
              ? "border-border bg-muted text-foreground hover:bg-muted/80"
              : "border-input bg-card text-foreground hover:border-primary",
        )}
      >
        <HandHelping className="size-5 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{triggerLabel}</span>
        <span className="sr-only sm:hidden">{copy.askQuestionShort}</span>
        {mentorReplied && (
          <span className="absolute -right-1 -top-1 flex size-3" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-yellow opacity-70" />
            <span className="relative inline-flex size-3 rounded-full bg-brand-yellow" />
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-foreground/40 backdrop:backdrop-blur-[2px] open:flex open:items-end open:justify-center sm:open:items-center sm:open:p-4"
        aria-labelledby="ask-help-title"
      >
        <div className="flex h-[92dvh] w-full max-w-none flex-col overflow-hidden rounded-t-3xl border border-border bg-card text-card-foreground shadow-2xl duration-200 animate-in fade-in zoom-in-95 sm:h-[min(42rem,90dvh)] sm:max-w-[34rem] sm:rounded-3xl">
          <ChatHeader
            titleId="ask-help-title"
            avatar={
              <ChatAvatar
                label={<GraduationCap className="size-5" aria-hidden />}
              />
            }
            title={copy.dialogTitle}
            subtitle={chapterTitle}
            status={status}
            actions={
              <>
                <Link
                  href="/my-questions"
                  onClick={close}
                  className={chatIconButton}
                  aria-label={copy.allQuestionsLink}
                  title={copy.allQuestionsLink}
                >
                  <MessagesSquare className="size-[18px]" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className={chatIconButton}
                  aria-label="Close"
                >
                  <X className="size-[18px]" aria-hidden />
                </button>
              </>
            }
          />

          <HelpThreadDetail
            variant="mentee"
            layout="modal"
            threadId={thread?.id ?? null}
            status={thread?.status ?? null}
            messages={thread?.messages ?? []}
            viewerId={viewerId}
            active={open}
            courseId={courseId}
            chapterId={chapterId}
          />
        </div>
      </dialog>
    </>
  );
}
