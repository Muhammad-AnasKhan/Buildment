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
import type { HelpMessageView } from "./help-types";

type BaseProps = {
  threadId: string | null;
  status: "OPEN" | "RESOLVED" | null;
  messages: HelpMessageView[];
  viewerId: string;
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
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isOpen = props.status === "OPEN";
  const isResolved = props.status === "RESOLVED";
  const hasThread = props.threadId != null && props.status != null;

  function sendMenteeNote() {
    setError(null);
    startTransition(async () => {
      const result =
        props.status === "OPEN" && props.threadId
          ? await replyToHelpThread({ threadId: props.threadId, body })
          : await askMentorFromChapter({
              courseId: props.variant === "mentee" ? props.courseId : "",
              chapterId: props.variant === "mentee" ? props.chapterId : "",
              body,
            });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  function sendMentorReply() {
    if (props.variant !== "mentor") return;
    setError(null);
    startTransition(async () => {
      const result = await replyToHelpThread({ threadId: props.threadId, body });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  function markResolved() {
    if (props.variant !== "mentor") return;
    setError(null);
    startTransition(async () => {
      const result = await resolveHelpThread({ threadId: props.threadId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const timelineBlock = (
    <>
      {!props.messages.length && props.variant === "mentee" && (
        <p className="text-sm leading-relaxed text-neutral-600">
          Tell your mentor what you&apos;re trying to do, what happened instead, and any error
          messages. They&apos;ll reply here — check back after you reload this page.
        </p>
      )}
      {props.messages.length > 0 && (
        <HelpNoteTimeline messages={props.messages} viewerId={props.viewerId} />
      )}
      {isResolved && props.variant === "mentee" && (
        <p
          className={cn(
            "text-xs text-neutral-500",
            props.messages.length > 0 ? "mt-4" : undefined
          )}
        >
          This request was marked resolved. Send a new note below if you&apos;re stuck again.
        </p>
      )}
    </>
  );

  const menteeComposer =
    props.variant === "mentee" ? (
      <HelpNoteComposer
        id={props.layout === "modal" ? "help-modal-note" : "help-page-note"}
        label={hasThread && isOpen ? "Add to your note" : "Your help note"}
        hint={
          hasThread && isOpen
            ? "Your mentor sees this on Mentee requests."
            : undefined
        }
        placeholder="What do you need help with on this lesson?"
        body={body}
        onBodyChange={setBody}
        onSubmit={sendMenteeNote}
        pending={pending}
        error={error}
        submitLabel={hasThread && isOpen ? "Add to note" : "Send note to mentor"}
        secondaryAction={
          props.footerLink ? (
            props.layout === "modal" ? (
              <Link
                href={props.footerLink.href}
                className="mr-auto text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
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
          hint="Your mentee sees this when they reopen the lesson or check My help notes."
          placeholder="Point them to the step, concept, or file to check…"
          body={body}
          onBodyChange={setBody}
          onSubmit={sendMentorReply}
          pending={pending}
          error={error}
          submitLabel="Send reply"
          secondaryAction={
            <button
              type="button"
              className={helpOutlineButton}
              disabled={pending}
              onClick={markResolved}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
              )}
              Mark resolved
            </button>
          }
        />
      ) : (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          Resolved — the mentee can open a new note from the chapter if they need more help.
        </p>
      )
    ) : null;

  if (props.layout === "modal" && props.variant === "mentee") {
    return (
      <>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{timelineBlock}</div>
        <div className="space-y-3 border-t border-neutral-100 bg-neutral-50/80 px-5 py-4">
          {menteeComposer}
          {props.footerLink && (
            <div className="flex justify-start sm:hidden">
              <Link
                href={props.footerLink.href}
                className="text-xs font-medium text-neutral-500 underline-offset-2 hover:underline"
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
      <div className="space-y-6">
        <section className={helpPanel}>{timelineBlock}</section>
        {isOpen || !hasThread ? (
          <section className={helpPanel}>{menteeComposer}</section>
        ) : (
          <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            Resolved — use <strong className="font-medium">Ask for help</strong> on the chapter to
            start a new note.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-neutral-900">Help note thread</h2>
        <div className={cn(helpPanel, "mt-4")}>{timelineBlock}</div>
      </section>
      <section className={helpPanel}>{mentorComposer}</section>
    </div>
  );
}
