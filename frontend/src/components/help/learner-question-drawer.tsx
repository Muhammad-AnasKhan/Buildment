"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCheck, Clock3, MessageCircle, X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { replyToHelpThread } from "@/server/actions/help";
import type { HelpThreadDetail } from "@/shared/api/help";
import { HelpNoteTimeline } from "./help-note-timeline";
import { HelpNoteComposer } from "./help-note-composer";

export function LearnerQuestionDrawer({
  selectedId,
  threadIds,
  viewerId,
  onClose,
  onSelect,
  onRead,
}: {
  selectedId: string | null;
  threadIds: string[];
  viewerId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onRead: (id: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [detail, setDetail] = useState<HelpThreadDetail | null>(null);
  const [loadFailure, setLoadFailure] = useState<{ key: string; message: string } | null>(null);
  const [reload, setReload] = useState(0);
  const [body, setBody] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const currentIndex = selectedId ? threadIds.indexOf(selectedId) : -1;
  const activeDetail = detail?.id === selectedId ? detail : null;
  const requestKey = selectedId ? `${selectedId}:${reload}` : "";
  const loadError = loadFailure?.key === requestKey ? loadFailure.message : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedId && !dialog.open) dialog.showModal();
    if (!selectedId && dialog.open) dialog.close();
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    apiFetch<HelpThreadDetail>(`/api/v1/help/threads/${encodeURIComponent(selectedId)}`, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setDetail(result);
        onRead(result.id);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadFailure({ key: `${selectedId}:${reload}`, message: error instanceof Error ? error.message : "Could not load this conversation." });
      });
    return () => controller.abort();
  }, [selectedId, reload, onRead]);

  function select(id: string) {
    setBody("");
    setSendError(null);
    onSelect(id);
  }

  function sendFollowUp() {
    if (!activeDetail || sending || body.trim().length < 10) return;
    setSendError(null);
    startSending(async () => {
      const result = await replyToHelpThread({ threadId: activeDetail.id, body });
      if (!result.ok) {
        setSendError(result.error);
        return;
      }
      setBody("");
      setReload((value) => value + 1);
      router.refresh();
    });
  }

  const lessonHref = activeDetail
    ? activeDetail.chapter
      ? `/courses/${activeDetail.course.slug}/${activeDetail.chapter.slug}`
      : `/courses/${activeDetail.course.slug}`
    : null;
  const lastMessage = activeDetail?.messages.at(-1);
  const status = activeDetail?.status === "RESOLVED"
    ? { label: "Resolved", icon: CheckCheck }
    : lastMessage && lastMessage.authorId !== viewerId
      ? { label: "Mentor replied", icon: MessageCircle }
      : { label: "Waiting for mentor", icon: Clock3 };
  const StatusIcon = status.icon;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      aria-labelledby="learner-question-title"
      className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 text-foreground backdrop:bg-black/60 open:flex"
    >
      <div className="ml-auto flex h-full w-full max-w-[44rem] flex-col border-l bg-background shadow-2xl">
        <header className="shrink-0 border-b px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {currentIndex >= 0 ? `Question ${currentIndex + 1} of ${threadIds.length}` : "Question"}
            </p>
            <button type="button" onClick={onClose} className="inline-flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Close conversation"><X className="size-4" aria-hidden /></button>
          </div>
          <h2 id="learner-question-title" className="mt-2 text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
            {activeDetail?.chapter?.title ?? activeDetail?.course.title ?? "Loading conversation…"}
          </h2>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{activeDetail?.course.title ?? "Your conversation with a mentor"}</p>
          {activeDetail && <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-medium"><StatusIcon className="size-3.5" aria-hidden />{status.label}</span>
            {lessonHref && <Link href={lessonHref} className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline">{activeDetail.chapter ? "Open lesson" : "Open course"}<ArrowUpRight className="size-3.5" aria-hidden /></Link>}
          </div>}
        </header>

        <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/20 px-4 py-2 sm:px-6">
          <button type="button" onClick={() => select(threadIds[currentIndex - 1])} disabled={currentIndex <= 0 || sending} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="size-4" aria-hidden />Previous</button>
          <button type="button" onClick={() => select(threadIds[currentIndex + 1])} disabled={currentIndex < 0 || currentIndex >= threadIds.length - 1 || sending} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">Next<ArrowRight className="size-4" aria-hidden /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
          {loadError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <p className="text-sm text-destructive" role="alert">{loadError}</p>
              <button type="button" onClick={() => setReload((value) => value + 1)} className="mt-3 text-sm font-medium underline underline-offset-4">Try again</button>
            </div>
          ) : activeDetail ? (
            <>
              <h3 className="mb-4 text-sm font-semibold">Conversation · {activeDetail.messages.length} {activeDetail.messages.length === 1 ? "message" : "messages"}</h3>
              <HelpNoteTimeline messages={activeDetail.messages} viewerId={viewerId} />
            </>
          ) : <div className="space-y-4" role="status" aria-label="Loading conversation"><div className="h-24 animate-pulse rounded-xl bg-muted" /><div className="h-24 animate-pulse rounded-xl bg-muted" /></div>}
        </div>

        {activeDetail?.status === "OPEN" ? (
          <div className="shrink-0 border-t bg-card px-4 py-4 sm:px-6">
            <HelpNoteComposer id="learner-question-follow-up" label="Add a follow-up" hint="Your mentor will see your message in this conversation." placeholder="What else would help your mentor understand the problem?" body={body} onBodyChange={setBody} onSubmit={sendFollowUp} pending={sending} error={sendError} submitLabel="Send follow-up" />
          </div>
        ) : activeDetail?.status === "RESOLVED" ? (
          <div className="shrink-0 border-t bg-card px-4 py-4 text-sm text-muted-foreground sm:px-6">This question is resolved. Open the lesson to ask a new question.</div>
        ) : null}
      </div>
    </dialog>
  );
}
