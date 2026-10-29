"use client";

import Link from "next/link";
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
import { helpOutlineButton, helpPanel } from "./help-styles";
import { cn } from "@/lib/utils";
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
  footerLink?: { href: string; label: string; onNavigate?: () => void };
};

type MentorProps = BaseProps & {
  variant: "mentor";
  layout: "page";
  status: "OPEN" | "RESOLVED";
  threadId: string;
};

export type HelpThreadDetailProps = MenteeProps | MentorProps;

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

  const timelineBlock = (
    <>
      {!chat.messages.length && props.variant === "mentee" && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tell your mentor what you&apos;re trying to do, what happened instead,
          and any error messages. They&apos;ll reply here — you&apos;ll see
          their answer appear as soon as they send it.
        </p>
      )}
      {chat.messages.length > 0 && (
        <HelpNoteTimeline
          messages={chat.messages}
          viewerId={props.viewerId}
          onReply={isOpen ? setReplyingTo : undefined}
          onRetry={(message) => void deliver(message)}
          initialScroll={
            props.layout === "modal" ? "unread-or-bottom" : "unread"
          }
          active={active}
        />
      )}
      {isResolved && props.variant === "mentee" && props.layout === "modal" && (
        <p
          className={cn(
            "text-xs text-muted-foreground",
            chat.messages.length > 0 ? "mt-4" : undefined,
          )}
        >
          {copy.resolvedFollowUpBelow}
        </p>
      )}
    </>
  );

  const menteeComposer =
    props.variant === "mentee" ? (
      <HelpNoteComposer
        id={props.layout === "modal" ? "help-modal-note" : "help-page-note"}
        label={hasThread && isOpen ? copy.composerFollowUp : copy.composerNew}
        hint={hasThread && isOpen ? copy.mentorSeesInbox : undefined}
        placeholder={copy.composerPlaceholder}
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
        secondaryAction={
          props.footerLink ? (
            props.layout === "modal" ? (
              <Link
                href={props.footerLink.href}
                className="mr-auto text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                onClick={props.footerLink.onNavigate}
              >
                {props.footerLink.label}
              </Link>
            ) : null
          ) : undefined
        }
      />
    ) : null;

  const mentorComposer =
    props.variant === "mentor" ? (
      isOpen ? (
        <HelpNoteComposer
          id="mentor-reply"
          label="Write a reply"
          hint={copy.mentorComposerHint}
          placeholder="Point them to the step, concept, or file to check…"
          body={body}
          onBodyChange={setBody}
          onSubmit={send}
          pending={resolving}
          error={error}
          submitLabel="Send reply"
          replyingTo={replyingTo}
          onCancelReply={cancelReply}
          secondaryAction={
            <button
              type="button"
              className={helpOutlineButton}
              disabled={resolving}
              onClick={markResolved}
            >
              {resolving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CheckCircle2 className="size-4 text-ok" aria-hidden />
              )}
              Mark resolved
            </button>
          }
        />
      ) : (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {copy.resolvedMentorSide}
        </p>
      )
    ) : null;

  if (props.layout === "modal" && props.variant === "mentee") {
    return (
      <>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {timelineBlock}
        </div>
        <div className="space-y-3 border-t border-border bg-muted/30 px-5 py-4">
          {menteeComposer}
          {props.footerLink && (
            <div className="flex justify-start sm:hidden">
              <Link
                href={props.footerLink.href}
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                onClick={props.footerLink.onNavigate}
              >
                {props.footerLink.label}
              </Link>
            </div>
          )}
        </div>
      </>
    );
  }

  if (props.variant === "mentee") {
    return (
      <div className="space-y-4">
        <section className={cn(helpPanel, "rounded-2xl p-4 sm:p-6")}>
          {timelineBlock}
        </section>
        {isOpen || !hasThread ? (
          <section className={cn(helpPanel, "rounded-2xl p-4 sm:p-6")}>
            {menteeComposer}
          </section>
        ) : (
          <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Resolved — use{" "}
            <strong className="font-medium">{copy.resolvedAskAgain}</strong> on
            the chapter to {copy.resolvedStartNew}.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-foreground">
          {copy.mentorThreadTitle}
        </h2>
        <div className={cn(helpPanel, "mt-4")}>{timelineBlock}</div>
      </section>
      <section className={helpPanel}>{mentorComposer}</section>
    </div>
  );
}
