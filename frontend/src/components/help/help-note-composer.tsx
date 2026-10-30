"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { Loader2, SendHorizontal, X } from "lucide-react";
import type { HelpMessageReplyPreview } from "@/shared/api/help";
import { helpUiCopy as copy } from "@/shared/lib/help-ui-copy";
import { cn } from "@/lib/utils";

const MIN_LENGTH = 10;
const MAX_HEIGHT_PX = 128;

// useLayoutEffect warns during server rendering; fall back to useEffect there.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The typing bar: a rounded pill that grows with what you type, with a round send button
 * inside it on the right — like WhatsApp. There is deliberately no label or hint text above
 * it; `label` and `submitLabel` are only the accessible names of the field and the button.
 */
export function HelpNoteComposer({
  id,
  label,
  placeholder,
  body,
  onBodyChange,
  onSubmit,
  pending,
  error,
  submitLabel,
  secondaryAction,
  replyingTo,
  onCancelReply,
  autoFocus = false,
  leading,
}: {
  id: string;
  /** Accessible name for the text field (not shown). */
  label: string;
  /** Kept so existing callers still type-check; no longer displayed above the bar. */
  hint?: string;
  placeholder: string;
  body: string;
  onBodyChange: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  error: string | null;
  /** Accessible name for the send button (not shown). */
  submitLabel: string;
  secondaryAction?: React.ReactNode;
  /** Set when the person picked "Reply" on an earlier message — shows a cancellable preview inside the bar. */
  replyingTo?: HelpMessageReplyPreview | null;
  onCancelReply?: () => void;
  /** Focus the field (e.g. when a popup opens). */
  autoFocus?: boolean;
  /** An optional round control shown inside the bar, on the left (e.g. the mentor's quick replies). */
  leading?: React.ReactNode;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const length = body.trim().length;
  const canSubmit = length >= MIN_LENGTH && !pending;
  const tooShort = length > 0 && length < MIN_LENGTH;

  // Grow with the text (up to a few lines) and shrink back after sending.
  useIsoLayoutEffect(() => {
    const field = textareaRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [body]);

  useEffect(() => {
    if (!autoFocus) return;
    const frame = requestAnimationFrame(() =>
      textareaRef.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  // Picking "Reply" on a message puts the cursor straight into the bar.
  const replyId = replyingTo?.id;
  useEffect(() => {
    if (replyId) textareaRef.current?.focus({ preventScroll: true });
  }, [replyId]);

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex flex-col rounded-[1.75rem] border border-border bg-card shadow-sm transition-[border-color,box-shadow] duration-150",
          "hover:border-primary/30 focus-within:border-primary/50 focus-within:shadow-md focus-within:ring-4 focus-within:ring-primary/10",
        )}
      >
        {replyingTo && (
          <div className="mx-1.5 mt-1.5 flex items-start gap-2 rounded-[1.25rem] bg-muted/70 px-3 py-2 duration-150 animate-in fade-in slide-in-from-bottom-1">
            <div className="min-w-0 flex-1 border-l-[3px] border-primary pl-2.5">
              <p className="truncate text-xs font-semibold text-primary">
                {copy.replyingToPrefix} {replyingTo.authorName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {replyingTo.body}
              </p>
            </div>
            {onCancelReply && (
              <button
                type="button"
                onClick={onCancelReply}
                className="mt-0.5 shrink-0 rounded-full p-1 text-muted-foreground outline-none transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={copy.cancelReply}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex items-end gap-2 p-2",
            leading ? "pl-1.5" : "pl-4",
          )}
        >
          {leading}
          <textarea
            ref={textareaRef}
            id={id}
            aria-label={label}
            value={body}
            rows={1}
            disabled={pending}
            placeholder={placeholder}
            onChange={(event) => onBodyChange(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends (like a chat app); Shift+Enter adds a new line.
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                if (canSubmit) onSubmit();
              }
            }}
            className="max-h-32 min-h-10 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            aria-label={submitLabel}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm outline-none transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-90 disabled:bg-primary/35 disabled:shadow-none disabled:hover:scale-100 disabled:active:scale-100"
          >
            {pending ? (
              <Loader2 className="size-[18px] animate-spin" aria-hidden />
            ) : (
              <SendHorizontal className="size-[18px]" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {tooShort && (
        <p className="mt-1.5 px-4 text-xs text-muted-foreground">
          Add a little more detail to send (at least {MIN_LENGTH} characters).
        </p>
      )}
      {error && (
        <p className="mt-1.5 px-4 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {secondaryAction && (
        <div className="mt-2 flex justify-end">{secondaryAction}</div>
      )}
    </div>
  );
}
