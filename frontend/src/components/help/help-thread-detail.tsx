"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  askMentorFromChapter,
  replyToHelpThread,
  resolveHelpThread,
} from "@/server/actions/help";
import { HelpNoteTimeline } from "./help-note-timeline";
import { HelpNoteComposer } from "./help-note-composer";
import { MentorQuickReplies } from "./mentor-quick-replies";
import { MentorThreadAside } from "./mentor-thread-aside";
import {
  ChatAvatar,
  ChatCanvas,
  ChatEmptyState,
  ChatFooter,
  ChatHeader,
  ChatSystemNote,
  type ChatTone,
} from "./help-chat-ui";
import { toast } from "@/components/ui/app-toast";
import { useRealtimeEvent } from "@/lib/realtime";
import { useHelpChat, type ChatMessage } from "@/lib/use-help-chat";
import type { HelpMessageView } from "@/shared/api/help";
import { helpUiCopy as copy } from "@/shared/lib/help-ui-copy";

type BaseProps = {
  threadId: string | null;
  status: "OPEN" | "RESOLVED" | null;
  messages: HelpMessageView[];
  viewerId: string;
  /** False while the chat is hidden (e.g. a closed modal), so it isn't marked seen. Defaults to true. */
  active?: boolean;
};

type MenteeProps = BaseProps & {
  variant: "mentee";
  courseId: string;
  chapterId: string;
  layout: "page" | "modal";
};

type MentorProps = BaseProps & {
  variant: "mentor";
  layout: "page";
  status: "OPEN" | "RESOLVED";
  threadId: string;
  /** Who the mentor is talking to — shown in the chat header. */
  header: { menteeName: string; subtitle: string };
  /** Details for the side panel with quick stats. */
  aside: {
    menteeId: string;
    menteeEmail: string;
    courseTitle: string;
    lessonTitle: string | null;
  };
};

export type HelpThreadDetailProps = MenteeProps | MentorProps;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function HelpThreadDetail(props: HelpThreadDetailProps) {
  const router = useRouter();
  const [resolving, startResolving] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<HelpMessageView | null>(null);

  const active = props.active ?? true;
  const isOpen = props.status === "OPEN";
  const isResolved = props.status === "RESOLVED";
  const hasThread = props.threadId != null && props.status != null;
  const composerId =
    props.variant === "mentor"
      ? "mentor-reply"
      : props.layout === "modal"
        ? "help-modal-note"
        : "help-page-note";

  // Live messages, receipts and optimistic sends layered on the server-rendered ones.
  const chat = useHelpChat({
    threadId: props.threadId,
    serverMessages: props.messages,
    viewerId: props.viewerId,
    active,
  });

  // The other side resolved the thread: re-read it so the composer closes and the notice shows.
  useRealtimeEvent("help-thread", (event) => {
    if (event.threadId === props.threadId) router.refresh();
  });

  function cancelReply() {
    setReplyingTo(null);
  }

  /** One-tap starters in the empty state fill the typing bar and put the cursor in it. */
  function pickStarter(text: string) {
    setBody(text);
    requestAnimationFrame(() => {
      const field = document.getElementById(composerId);
      if (field instanceof HTMLTextAreaElement) {
        field.focus({ preventScroll: true });
        field.setSelectionRange(text.length, text.length);
      }
    });
  }

  /** A quick reply drops its text into the typing bar (appended to anything already typed). */
  function pickQuickReply(text: string) {
    setBody((current) =>
      current.trim() ? `${current.trimEnd()} ${text}` : text,
    );
    requestAnimationFrame(() => {
      const field = document.getElementById(composerId);
      if (field instanceof HTMLTextAreaElement) {
        field.focus({ preventScroll: true });
        field.setSelectionRange(field.value.length, field.value.length);
      }
    });
  }

  /** Sends (or re-sends) a message that is already on screen with a clock. */
  async function deliver(pending: ChatMessage) {
    chat.setPendingState(pending.id, "pending");
    try {
      const result =
        props.status === "OPEN" && props.threadId
          ? await replyToHelpThread({
              threadId: props.threadId,
              body: pending.body,
              replyToId: pending.replyTo?.id,
            })
          : props.variant === "mentee"
            ? await askMentorFromChapter({
                courseId: props.courseId,
                chapterId: props.chapterId,
                body: pending.body,
              })
            : { ok: false as const, error: "This conversation is closed." };

      if (!result.ok) {
        chat.setPendingState(pending.id, "failed");
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

  function send() {
    const text = body.trim();
    if (text.length < 10) return;
    const pending = chat.addPending({
      body: text,
      role: props.variant === "mentor" ? "MENTOR" : "MENTEE",
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            body: replyingTo.body,
            authorName: replyingTo.authorName,
          }
        : null,
    });
    // The message is on screen already; clear the box so the next one can be typed right away.
    setBody("");
    setReplyingTo(null);
    setError(null);
    void deliver(pending);
  }

  function markResolved() {
    if (props.variant !== "mentor") return;
    setError(null);
    startResolving(async () => {
      const result = await resolveHelpThread({ threadId: props.threadId });
      if (!result.ok) {
        setError(result.error);
        toast(result.error);
        return;
      }
      router.refresh();
    });
  }

  const hasMessages = chat.messages.length > 0;

  const timelineBlock = (
    <>
      {!hasMessages && props.variant === "mentee" && (
        <ChatEmptyState onPick={pickStarter} />
      )}
      {hasMessages && (
        <HelpNoteTimeline
          messages={chat.messages}
          viewerId={props.viewerId}
          onReply={isOpen ? setReplyingTo : undefined}
          onRetry={(message) => void deliver(message)}
          initialScroll={
            props.layout === "modal" || props.variant === "mentor"
              ? "unread-or-bottom"
              : "unread"
          }
          active={active}
        />
      )}
      {isResolved && props.variant === "mentee" && props.layout === "modal" && (
        <ChatSystemNote>{copy.resolvedFollowUpBelow}</ChatSystemNote>
      )}
    </>
  );

  const menteeComposer =
    props.variant === "mentee" ? (
      <HelpNoteComposer
        id={composerId}
        label={hasThread && isOpen ? copy.composerFollowUp : copy.composerNew}
        placeholder={
          hasThread && isOpen
            ? "Type a message"
            : "Describe what you're stuck on…"
        }
        body={body}
        onBodyChange={setBody}
        onSubmit={send}
        pending={false}
        error={error}
        submitLabel={
          hasThread && isOpen ? copy.sendFollowUp : copy.sendToMentor
        }
        replyingTo={hasThread && isOpen ? replyingTo : null}
        onCancelReply={cancelReply}
        autoFocus={props.layout === "modal" && active}
      />
    ) : null;

  // Popup on a lesson: just the conversation and the typing bar; the dialog supplies the header.
  if (props.layout === "modal" && props.variant === "mentee") {
    return (
      <>
        <ChatCanvas center={!hasMessages} aria-live="polite">
          {timelineBlock}
        </ChatCanvas>
        <ChatFooter>{menteeComposer}</ChatFooter>
      </>
    );
  }

  if (props.variant === "mentee") {
    return (
      <section className="flex h-[min(42rem,80dvh)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <ChatCanvas center={!hasMessages} aria-live="polite">
          {timelineBlock}
        </ChatCanvas>
        {isOpen || !hasThread ? (
          <ChatFooter>{menteeComposer}</ChatFooter>
        ) : (
          <ChatFooter>
            <p className="mx-auto w-fit rounded-2xl bg-muted px-4 py-2 text-center text-sm text-muted-foreground">
              Resolved — use{" "}
              <strong className="font-medium">{copy.resolvedAskAgain}</strong>{" "}
              on the chapter to {copy.resolvedStartNew}.
            </p>
          </ChatFooter>
        )}
      </section>
    );
  }

  // Mentor: a full chat window with the learner's name on top and "Mark resolved" in the header.
  const lastMessage = chat.messages[chat.messages.length - 1];
  const status: { label: string; tone: ChatTone } = isResolved
    ? { label: "Resolved", tone: "ok" }
    : lastMessage && lastMessage.authorId !== props.viewerId
      ? { label: "Needs your reply", tone: "waiting" }
      : { label: "You replied", tone: "info" };

  return (
    <div className="grid min-w-0 items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex h-[min(46rem,calc(100dvh-4rem))] min-h-[28rem] min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-md">
        <ChatHeader
          avatar={
            <ChatAvatar
              label={initials(props.header.menteeName)}
              variant="soft"
            />
          }
          title={props.header.menteeName}
          subtitle={props.header.subtitle}
          status={status}
          actions={
            isOpen ? (
              <button
                type="button"
                disabled={resolving}
                onClick={markResolved}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-sm font-medium text-foreground outline-none transition-colors hover:border-ok/40 hover:bg-ok-soft hover:text-ok focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
              >
                {resolving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <CheckCircle2 className="size-4" aria-hidden />
                )}
                <span className="hidden sm:inline">Mark resolved</span>
                <span className="sr-only sm:hidden">Mark resolved</span>
              </button>
            ) : undefined
          }
        />
        <ChatCanvas aria-live="polite">{timelineBlock}</ChatCanvas>
        <ChatFooter>
          {isOpen ? (
            <HelpNoteComposer
              id={composerId}
              label="Write a reply"
              placeholder="Type a reply"
              body={body}
              onBodyChange={setBody}
              onSubmit={send}
              pending={false}
              error={error}
              submitLabel="Send reply"
              replyingTo={replyingTo}
              onCancelReply={cancelReply}
              leading={<MentorQuickReplies onPick={pickQuickReply} />}
            />
          ) : (
            <p className="mx-auto w-fit max-w-full rounded-2xl bg-muted px-4 py-2 text-center text-sm text-muted-foreground">
              {copy.resolvedMentorSide}
            </p>
          )}
        </ChatFooter>
      </section>
      <MentorThreadAside
        menteeName={props.header.menteeName}
        menteeEmail={props.aside.menteeEmail}
        menteeId={props.aside.menteeId}
        viewerId={props.viewerId}
        className="h-[min(46rem,calc(100dvh-4rem))] min-h-0 overflow-y-visible lg:self-start lg:[@media(min-height:780px)]:sticky lg:[@media(min-height:780px)]:top-8"
        courseTitle={props.aside.courseTitle}
        lessonTitle={props.aside.lessonTitle}
        status={props.status}
        messages={chat.messages}
      />
    </div>
  );
}
