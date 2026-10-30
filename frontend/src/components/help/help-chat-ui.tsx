"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ComponentProps, ReactNode } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

// Building blocks shared by every place a conversation is shown (the Ask-a-question popup,
// the learner's side drawer and the mentor's thread page), so they all look and feel alike.

export type ChatTone = "info" | "ok" | "waiting" | "muted";

const STATUS_DOT: Record<ChatTone, string> = {
  info: "bg-primary",
  ok: "bg-ok",
  waiting: "bg-brand-yellow",
  muted: "bg-muted-foreground/60",
};

const STATUS_TEXT: Record<ChatTone, string> = {
  info: "text-primary",
  ok: "text-ok",
  waiting: "text-muted-foreground",
  muted: "text-muted-foreground",
};

/** Round icon button used in chat headers (close, previous, next, open lesson…). */
export const chatIconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

export function ChatAvatar({
  label,
  variant = "solid",
  className,
}: {
  label: ReactNode;
  variant?: "solid" | "soft";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 select-none items-center justify-center rounded-full text-sm font-semibold",
        variant === "solid"
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-primary",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function ChatHeader({
  avatar,
  title,
  titleId,
  subtitle,
  status,
  actions,
  className,
}: {
  avatar: ReactNode;
  title: ReactNode;
  titleId?: string;
  subtitle?: ReactNode;
  status?: { label: string; tone: ChatTone };
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3.5 sm:px-5",
        className,
      )}
    >
      {avatar}
      <div className="min-w-0 flex-1">
        <h2
          id={titleId}
          className="truncate text-[15px] font-semibold leading-tight text-foreground"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
        {status && (
          <p
            className={cn(
              "mt-0.5 flex items-center gap-1.5 text-xs font-medium",
              STATUS_TEXT[status.tone],
            )}
          >
            <span
              className={cn("size-1.5 rounded-full", STATUS_DOT[status.tone])}
              aria-hidden
            />
            {status.label}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-1">{actions}</div>
      )}
    </header>
  );
}

// A faint dotted pattern in the app's own border colour, so the chat area has the "chat wallpaper"
// feel without leaving the palette.
const CANVAS_PATTERN: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
  backgroundSize: "22px 22px",
};

/**
 * The scrolling message area. Short conversations sit at the bottom, like a chat app;
 * pass `center` to centre something (the empty state) instead. When you scroll up to
 * read older messages, a round button appears to jump back to the latest one.
 */
export function ChatCanvas({
  children,
  center = false,
  className,
  ...rest
}: { center?: boolean } & ComponentProps<"div">) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [awayFromLatest, setAwayFromLatest] = useState(false);

  const measure = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setAwayFromLatest(
      element.scrollHeight - element.scrollTop - element.clientHeight > 160,
    );
  }, []);

  // Re-check after every render too, so a message arriving while you are scrolled up shows the button.
  useEffect(() => {
    measure();
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        {...rest}
        ref={scrollRef}
        onScroll={measure}
        style={CANVAS_PATTERN}
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain bg-background px-3 py-4 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        <div className={cn("w-full", center ? "my-auto" : "mt-auto")}>
          {children}
        </div>
      </div>
      {awayFromLatest && (
        <button
          type="button"
          onClick={() =>
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
          aria-label="Jump to latest message"
          title="Jump to latest message"
          className="absolute bottom-3 right-4 flex size-10 items-center justify-center rounded-full bg-card text-primary shadow-lg ring-1 ring-border outline-none transition-transform duration-150 animate-in fade-in zoom-in-90 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown className="size-5" aria-hidden />
        </button>
      )}
    </div>
  );
}

/** Holds the typing bar (and nothing else) at the bottom of a chat window. */
export function ChatFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-border bg-background px-3 py-3 sm:px-5 sm:py-3.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A small centred note inside the conversation, like WhatsApp's system messages. */
export function ChatSystemNote({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto my-3 w-fit max-w-[92%] rounded-full bg-card/90 px-3.5 py-1.5 text-center text-xs text-muted-foreground shadow-sm ring-1 ring-border">
      {children}
    </p>
  );
}

const STARTERS = [
  {
    label: "I'm stuck on a step",
    text: "I'm stuck on a step in this lesson. ",
  },
  {
    label: "I'm getting an error",
    text: "I'm getting an error and I'm not sure why. ",
  },
  {
    label: "Explain this concept",
    text: "Could you explain this concept again? ",
  },
];

/** Shown before the first message: a friendly prompt plus one-tap starters that fill the typing bar. */
export function ChatEmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-5 px-4 py-6 text-center duration-300 animate-in fade-in">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageCircleQuestion className="size-8" aria-hidden />
      </span>
      <div>
        <p className="text-base font-semibold text-foreground">
          Ask your mentor
        </p>
        <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Say what you are trying to do and where it goes wrong. Your
          mentor&apos;s reply shows up right here.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {STARTERS.map((starter) => (
          <button
            key={starter.label}
            type="button"
            onClick={() => onPick(starter.text)}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            {starter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
