"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { replyToHelpThread } from "@/server/actions/help";
import { toast } from "@/components/ui/app-toast";
import { useRealtimeEvent } from "@/lib/realtime";
import { useHelpChat, type ChatMessage } from "@/lib/use-help-chat";
import type { HelpMessageView, HelpThreadDetail } from "@/shared/api/help";
import { HelpNoteTimeline } from "./help-note-timeline";
import { HelpNoteComposer } from "./help-note-composer";
import {
  ChatAvatar,
  ChatCanvas,
  ChatFooter,
  ChatHeader,
  chatIconButton,
  type ChatTone,
} from "./help-chat-ui";

const NO_MESSAGES: HelpMessageView[] = [];

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
  const [loadFailure, setLoadFailure] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [reload, setReload] = useState(0);
  const [body, setBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<HelpMessageView | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const currentIndex = selectedId ? threadIds.indexOf(selectedId) : -1;
  const activeDetail = detail?.id === selectedId ? detail : null;
  const requestKey = selectedId ? `${selectedId}:${reload}` : "";
  const loadError =
    loadFailure?.key === requestKey ? loadFailure.message : null;

  // Live messages, receipts and optimistic sends layered on the loaded conversation.
  const chat = useHelpChat({
    threadId: activeDetail?.id ?? null,
    serverMessages: activeDetail?.messages ?? NO_MESSAGES,
    viewerId,
    active: selectedId !== null,
  });

  // The mentor resolved the open conversation: reload it so the composer closes.
  useRealtimeEvent("help-thread", (event) => {
    if (event.threadId === selectedId) setReload((value) => value + 1);
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedId && !dialog.open) dialog.showModal();
    if (!selectedId && dialog.open) dialog.close();
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    apiFetch<HelpThreadDetail>(
      `/api/v1/help/threads/${encodeURIComponent(selectedId)}`,
      { signal: controller.signal },
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        setDetail(result);
        onRead(result.id);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadFailure({
          key: `${selectedId}:${reload}`,
          message:
            error instanceof Error
              ? error.message
              : "Could not load this conversation.",
        });
      });
    return () => controller.abort();
  }, [selectedId, reload, onRead]);

  function select(id: string) {
    setBody("");
    setSendError(null);
    setReplyingTo(null);
    onSelect(id);
  }

  /** Sends (or re-sends) a follow-up that is already on screen with a clock. */
  async function deliver(pending: ChatMessage) {
    if (!activeDetail) return;
    chat.setPendingState(pending.id, "pending");
    try {
      const result = await replyToHelpThread({
        threadId: activeDetail.id,
        body: pending.body,
        replyToId: pending.replyTo?.id,
      });
      if (!result.ok) {
        chat.setPendingState(pending.id, "failed");
        setSendError(result.error);
        toast(result.error);
        return;
      }
      if (result.message) chat.settle(pending.id, result.message);
      else chat.discard(pending.id);
      router.refresh();
    } catch {
      chat.setPendingState(pending.id, "failed");
      toast("Message could not be sent. Check your connection and tap Retry.");
    }
  }

  function sendFollowUp() {
    if (!activeDetail || body.trim().length < 10) return;
    const pending = chat.addPending({
      body: body.trim(),
      role: "MENTEE",
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            body: replyingTo.body,
            authorName: replyingTo.authorName,
          }
        : null,
    });
    setBody("");
    setReplyingTo(null);
    setSendError(null);
    void deliver(pending);
  }

  const lessonHref = activeDetail
    ? activeDetail.chapter
      ? `/courses/${activeDetail.course.slug}/${activeDetail.chapter.slug}`
      : `/courses/${activeDetail.course.slug}`
    : null;
  const lastMessage = chat.messages.at(-1);
  const status: { label: string; tone: ChatTone } =
    activeDetail?.status === "RESOLVED"
      ? { label: "Resolved", tone: "ok" }
      : lastMessage && lastMessage.authorId !== viewerId
        ? { label: "Mentor replied", tone: "info" }
        : { label: "Waiting for your mentor", tone: "waiting" };
  const isOpenThread = activeDetail?.status === "OPEN";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="learner-question-title"
      className="fixed inset-0 z-50 m-0 h-[100dvh] max-h-none w-full max-w-none border-0 bg-transparent p-0 text-foreground backdrop:bg-foreground/40 backdrop:backdrop-blur-[2px] open:flex open:overflow-hidden"
    >
      <div className="ml-auto flex h-full min-h-0 w-full max-w-[42rem] flex-col overflow-hidden border-l border-border bg-card shadow-2xl duration-300 animate-in slide-in-from-right">
        <ChatHeader
          titleId="learner-question-title"
          avatar={
            <ChatAvatar
              label={<GraduationCap className="size-5" aria-hidden />}
            />
          }
          title={
            activeDetail?.chapter?.title ??
            activeDetail?.course.title ??
            "Loading conversation…"
          }
          subtitle={
            activeDetail?.course.title ?? "Your conversation with a mentor"
          }
          status={activeDetail ? status : undefined}
          actions={
            <>
              {threadIds.length > 1 && currentIndex >= 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => select(threadIds[currentIndex - 1])}
                    disabled={currentIndex <= 0}
                    className={chatIconButton}
                    aria-label="Previous question"
                    title="Previous question"
                  >
                    <ChevronLeft className="size-[18px]" aria-hidden />
                  </button>
                  <span
                    className="min-w-9 text-center text-xs font-medium tabular-nums text-muted-foreground"
                    aria-live="polite"
                  >
                    {currentIndex + 1}/{threadIds.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => select(threadIds[currentIndex + 1])}
                    disabled={currentIndex >= threadIds.length - 1}
                    className={chatIconButton}
                    aria-label="Next question"
                    title="Next question"
                  >
                    <ChevronRight className="size-[18px]" aria-hidden />
                  </button>
                </>
              )}
              {lessonHref && (
                <Link
                  href={lessonHref}
                  className={chatIconButton}
                  aria-label={
                    activeDetail?.chapter ? "Open lesson" : "Open course"
                  }
                  title={activeDetail?.chapter ? "Open lesson" : "Open course"}
                >
                  <BookOpen className="size-[18px]" aria-hidden />
                </Link>
              )}
              <button
                type="button"
                onClick={onClose}
                className={chatIconButton}
                aria-label="Close conversation"
              >
                <X className="size-[18px]" aria-hidden />
              </button>
            </>
          }
        />

        {loadError ? (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-background p-6">
            <div className="max-w-sm rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center">
              <p className="text-sm text-destructive" role="alert">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => setReload((value) => value + 1)}
                className="mt-3 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                Try again
              </button>
            </div>
          </div>
        ) : activeDetail ? (
          <ChatCanvas aria-live="polite">
            <HelpNoteTimeline
              key={activeDetail.id}
              messages={chat.messages}
              viewerId={viewerId}
              onReply={isOpenThread ? setReplyingTo : undefined}
              onRetry={(message) => void deliver(message)}
              initialScroll="unread-or-bottom"
            />
          </ChatCanvas>
        ) : (
          <ChatCanvas role="status" aria-label="Loading conversation">
            <div className="space-y-3">
              <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-card" />
              <div className="ml-auto h-14 w-1/2 animate-pulse rounded-2xl bg-primary/20" />
              <div className="h-20 w-3/4 animate-pulse rounded-2xl bg-card" />
            </div>
          </ChatCanvas>
        )}

        {activeDetail?.status === "OPEN" ? (
          <ChatFooter>
            <HelpNoteComposer
              id="learner-question-follow-up"
              label="Add a follow-up"
              placeholder="Type a message"
              body={body}
              onBodyChange={setBody}
              onSubmit={sendFollowUp}
              pending={false}
              error={sendError}
              submitLabel="Send follow-up"
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </ChatFooter>
        ) : activeDetail?.status === "RESOLVED" ? (
          <ChatFooter>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
              <span>This question is resolved.</span>
              {lessonHref && (
                <Link
                  href={lessonHref}
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Ask a new question from the lesson
                </Link>
              )}
            </div>
          </ChatFooter>
        ) : null}
      </div>
    </dialog>
  );
}
