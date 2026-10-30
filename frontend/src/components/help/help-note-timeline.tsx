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

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function dayKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** "Today", "Yesterday", a weekday for the last week, otherwise the date. */
function formatDay(iso: string) {
  const date = new Date(iso);
  const startOf = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(date)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7)
    return date.toLocaleDateString(undefined, { weekday: "long" });
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

/** WhatsApp-style receipt on your own messages: clock → ✓ sent → ✓✓ delivered → blue ✓✓ seen. */
function MessageTicks({ message }: { message: ChatMessage }) {
  if (message.clientState === "failed") {
    return (
      <span className="inline-flex" title="Not sent">
        <AlertCircle className="size-3.5 text-red-300" aria-hidden />
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

  // Messages already on screen when the chat appeared; only later ones animate in.
  const [initialKeys] = useState(
    () => new Set(messages.map((message) => message.clientKey ?? message.id)),
  );

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
      <ul ref={listRef} className="flex flex-col">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const isMine = message.authorId === viewerId;
          const newDay =
            !previous ||
            dayKey(previous.createdAt) !== dayKey(message.createdAt);
          const startsGroup = newDay || previous?.authorId !== message.authorId;
          const roleLabel =
            message.authorRole === "MENTOR"
              ? "Mentor"
              : isMine
                ? "You"
                : message.authorName;
          const failed = message.clientState === "failed";
          const messageKey = message.clientKey ?? message.id;
          const isNew = !initialKeys.has(messageKey);

          return (
            <Fragment key={messageKey}>
              {newDay && (
                <li
                  role="separator"
                  className="my-3 flex justify-center first:mt-0"
                >
                  <span
                    suppressHydrationWarning
                    className="rounded-full bg-card/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm ring-1 ring-border"
                  >
                    {formatDay(message.createdAt)}
                  </span>
                </li>
              )}
              {message.id === unreadAnchorId && (
                <li
                  role="separator"
                  className="my-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-primary"
                >
                  <span className="h-px flex-1 bg-primary/25" aria-hidden />
                  <span className="rounded-full bg-primary/10 px-3 py-1">
                    {copy.unreadDivider}
                  </span>
                  <span className="h-px flex-1 bg-primary/25" aria-hidden />
                </li>
              )}
              <li
                data-message-id={message.id}
                className={cn(
                  "group/message flex scroll-mt-10",
                  isMine ? "justify-end" : "justify-start",
                  startsGroup && !newDay ? "mt-3" : "mt-0.5",
                  isNew &&
                    "duration-200 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
                )}
              >
                <div
                  className={cn(
                    "flex max-w-[86%] flex-col sm:max-w-[78%]",
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
                        "relative min-w-0 rounded-xl px-2.5 pb-1.5 pt-1.5 text-[14.5px] leading-[1.4] shadow-sm",
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-foreground",
                        // The first bubble of a run gets a square corner plus a small "tail", like WhatsApp.
                        startsGroup &&
                          (isMine ? "rounded-tr-none" : "rounded-tl-none"),
                        message.clientState === "pending" && "opacity-80",
                        failed && "ring-1 ring-red-400/70",
                      )}
                    >
                      {startsGroup && (
                        <span
                          aria-hidden
                          className={cn(
                            "absolute top-0 h-3 w-2",
                            isMine
                              ? "-right-[7px] bg-primary [clip-path:polygon(0_0,100%_0,0_100%)]"
                              : "-left-[7px] bg-card [clip-path:polygon(100%_0,100%_100%,0_0)]",
                          )}
                        />
                      )}

                      {!isMine && startsGroup && (
                        <p className="mb-0.5 text-xs font-semibold text-primary">
                          {roleLabel}
                        </p>
                      )}

                      {message.replyTo && (
                        <blockquote
                          className={cn(
                            "mb-1.5 overflow-hidden rounded-lg border-l-[3px] px-2.5 py-1.5 text-xs",
                            isMine
                              ? "border-primary-foreground/50 bg-black/15 text-primary-foreground/85"
                              : "border-primary bg-muted/70 text-muted-foreground",
                          )}
                        >
                          <p
                            className={cn(
                              "truncate font-semibold",
                              !isMine && "text-primary",
                            )}
                          >
                            {message.replyTo.authorName}
                          </p>
                          <p className="line-clamp-2">{message.replyTo.body}</p>
                        </blockquote>
                      )}

                      {/* The text and the time share a line, like the reference: the time sits at the
                          bottom right, and the invisible spacer keeps long text clear of it. */}
                      <p className="whitespace-pre-wrap break-words">
                        {message.body}
                        <span
                          aria-hidden
                          className={cn(
                            "inline-block",
                            isMine ? "w-[4.75rem]" : "w-[3.5rem]",
                          )}
                        />
                      </p>
                      <div
                        className={cn(
                          "absolute bottom-1 right-2 flex items-center gap-1 text-[11px] leading-none",
                          isMine
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        <time
                          dateTime={message.createdAt}
                          suppressHydrationWarning
                        >
                          {formatTime(message.createdAt)}
                        </time>
                        {isMine && <MessageTicks message={message} />}
                      </div>
                    </article>

                    {onReply && !message.clientState && (
                      <button
                        type="button"
                        onClick={() => onReply(message)}
                        className="mb-1 shrink-0 rounded-full bg-card p-1.5 text-muted-foreground opacity-0 shadow-sm ring-1 ring-border outline-none transition-all hover:text-primary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover/message:opacity-100 [@media(hover:none)]:opacity-100"
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
                          className="font-semibold underline underline-offset-2"
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
      <div ref={endRef} aria-hidden className="scroll-mb-32" />
    </>
  );
}
