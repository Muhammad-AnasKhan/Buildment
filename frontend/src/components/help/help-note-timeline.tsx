"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  Reply as ReplyIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/use-help-chat";
import { helpUiCopy as copy } from "@/shared/lib/help-ui-copy";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** WhatsApp-style receipt on your own messages: clock → ✓ sent → ✓✓ delivered → blue ✓✓ seen. */
function MessageTicks({ message }: { message: ChatMessage }) {
  if (message.clientState === "failed") {
    return (
      <span className="inline-flex" title="Not sent">
        <AlertCircle className="size-3.5 text-red-400" aria-hidden />
        <span className="sr-only">Not sent</span>
      </span>
    );
  }
  if (message.clientState === "pending") {
    return (
      <span className="inline-flex" title="Sending">
        <Clock className="size-3 text-primary-foreground/60" aria-hidden />
        <span className="sr-only">Sending</span>
      </span>
    );
  }
  if (message.seenAt) {
    return (
      <span className="inline-flex" title="Seen">
        <CheckCheck className="size-3.5 text-sky-400" aria-hidden />
        <span className="sr-only">Seen</span>
      </span>
    );
  }
  if (message.deliveredAt) {
    return (
      <span className="inline-flex" title="Delivered">
        <CheckCheck
          className="size-3.5 text-primary-foreground/60"
          aria-hidden
        />
        <span className="sr-only">Delivered</span>
      </span>
    );
  }
  return (
    <span className="inline-flex" title="Sent">
      <Check className="size-3.5 text-primary-foreground/60" aria-hidden />
      <span className="sr-only">Sent</span>
    </span>
  );
}

function firstUnreadId(
  messages: ChatMessage[],
  viewerId: string,
): string | null {
  return (
    messages.find(
      (message) =>
        message.authorId !== viewerId &&
        !message.seenAt &&
        !message.clientState,
    )?.id ?? null
  );
}

/** The nearest ancestor that scrolls, or null when the page itself does. */
function scrollParent(node: HTMLElement | null): HTMLElement | null {
  for (
    let parent = node?.parentElement ?? null;
    parent;
    parent = parent.parentElement
  ) {
    const overflowY = getComputedStyle(parent).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return parent;
  }
  return null;
}

export function HelpNoteTimeline({
  messages,
  viewerId,
  /** Omit to render read-only (no reply affordance) — e.g. a resolved thread. */
  onReply,
  /** Called for a message that failed to send, to try it again. */
  onRetry,
  /**
   * Where to land when the conversation opens: "unread" jumps to the first message you
   * have not read yet (if any), "unread-or-bottom" falls back to the newest message, and
   * "none" leaves the scroll position alone.
   */
  initialScroll = "none",
  /** While this is false the chat is hidden (closed modal) and the opening scroll waits. */
  active = true,
}: {
  messages: ChatMessage[];
  viewerId: string;
  onReply?: (message: ChatMessage) => void;
  onRetry?: (message: ChatMessage) => void;
  initialScroll?: "none" | "unread" | "unread-or-bottom";
  active?: boolean;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(messages.length);

  const latestMessages = useRef(messages);
  useEffect(() => {
    latestMessages.current = messages;
  });

  // The first message you had not read when the chat opened. Fixed at that moment, so the
  // "New messages" divider stays put after those messages are marked seen a moment later.
  const [unreadAnchorId, setUnreadAnchorId] = useState<string | null>(null);

  // Opening (or re-opening a modal): land on the first unread message, else the newest.
  useEffect(() => {
    if (!active) return;
    const anchor = firstUnreadId(latestMessages.current, viewerId);
    setUnreadAnchorId(anchor);
    if (initialScroll === "none") return;
    const frame = requestAnimationFrame(() => {
      if (anchor)
        listRef.current
          ?.querySelector(`[data-message-id="${anchor}"]`)
          ?.scrollIntoView({ block: "start" });
      else if (initialScroll === "unread-or-bottom")
        endRef.current?.scrollIntoView({ block: "end" });
    });
    return () => cancelAnimationFrame(frame);
  }, [active, initialScroll, viewerId]);

  // A new message arrives or is sent: follow it, unless you scrolled up to read older ones.
  useEffect(() => {
    const grew = messages.length > lastCount.current;
    lastCount.current = messages.length;
    const end = endRef.current;
    if (!grew || !end) return;

    const last = messages[messages.length - 1];
    const lastItem = listRef.current?.lastElementChild as HTMLElement | null;
    const containerBottom =
      scrollParent(end)?.getBoundingClientRect().bottom ?? window.innerHeight;
    const distanceBeforeIt =
      end.getBoundingClientRect().top -
      containerBottom -
      (lastItem?.offsetHeight ?? 0) -
      12;
    if (last?.authorId === viewerId || distanceBeforeIt < 80) {
      end.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [messages, viewerId]);

  if (messages.length === 0) return null;

  return (
    <>
      <ul ref={listRef} className="space-y-3">
        {messages.map((message) => {
          const isMine = message.authorId === viewerId;
          const roleLabel =
            message.authorRole === "MENTOR"
              ? "Mentor"
              : isMine
                ? "You"
                : message.authorName;
          const failed = message.clientState === "failed";

          return (
            <Fragment key={message.id}>
              {message.id === unreadAnchorId && (
                <li
                  role="separator"
                  className="flex items-center gap-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary"
                >
                  <span className="h-px flex-1 bg-primary/30" aria-hidden />
                  {copy.unreadDivider}
                  <span className="h-px flex-1 bg-primary/30" aria-hidden />
                </li>
              )}
              <li
                data-message-id={message.id}
                className={cn(
                  "group/message flex scroll-mt-10",
                  isMine ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "flex max-w-[85%] flex-col sm:max-w-[75%]",
                    isMine ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-end gap-1.5",
                      isMine && "flex-row-reverse",
                    )}
                  >
                    <article
                      className={cn(
                        "min-w-0 rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed",
                        isMine
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm border border-border bg-card text-foreground",
                        message.clientState === "pending" && "opacity-80",
                        failed && "ring-1 ring-red-400/60",
                      )}
                    >
                      {!isMine && (
                        <p className="text-xs font-semibold text-muted-foreground">
                          {roleLabel}
                        </p>
                      )}

                      {message.replyTo && (
                        <blockquote
                          className={cn(
                            "mb-1.5 overflow-hidden rounded-md border-l-2 px-2 py-1 text-xs",
                            isMine
                              ? "border-primary-foreground/40 bg-black/10 text-primary-foreground/80"
                              : "border-border bg-muted/60 text-muted-foreground",
                          )}
                        >
                          <p className="truncate font-medium">
                            {message.replyTo.authorName}
                          </p>
                          <p className="line-clamp-2">{message.replyTo.body}</p>
                        </blockquote>
                      )}

                      <p className="whitespace-pre-wrap break-words">
                        {message.body}
                      </p>
                      <div
                        className={cn(
                          "mt-1 flex items-center justify-end gap-1 text-[11px]",
                          isMine
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        <time dateTime={message.createdAt}>
                          {formatWhen(message.createdAt)}
                        </time>
                        {isMine && <MessageTicks message={message} />}
                      </div>
                    </article>

                    {onReply && !message.clientState && (
                      <button
                        type="button"
                        onClick={() => onReply(message)}
                        className="shrink-0 rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/message:opacity-100"
                        aria-label={`${copy.replyAction} to ${roleLabel}`}
                      >
                        <ReplyIcon className="size-3.5" aria-hidden />
                      </button>
                    )}
                  </div>

                  {failed && (
                    <p className="mt-1 text-xs text-red-500">
                      Not sent.{" "}
                      {onRetry && (
                        <button
                          type="button"
                          onClick={() => onRetry(message)}
                          className="font-medium underline underline-offset-2"
                        >
                          Retry
                        </button>
                      )}
                    </p>
                  )}
                </div>
              </li>
            </Fragment>
          );
        })}
      </ul>
      <div ref={endRef} aria-hidden />
    </>
  );
}
