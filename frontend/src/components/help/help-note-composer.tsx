"use client";

import { Loader2, X } from "lucide-react";
import { helpPrimaryButton, helpTextarea } from "./help-styles";
import type { HelpMessageReplyPreview } from "@/shared/api/help";
import { helpUiCopy as copy } from "@/shared/lib/help-ui-copy";
import { cn } from "@/lib/utils";

const MIN_LENGTH = 10;

export function HelpNoteComposer({
  id,
  label,
  hint,
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
}: {
  id: string;
  label: string;
  hint?: string;
  placeholder: string;
  body: string;
  onBodyChange: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  error: string | null;
  submitLabel: string;
  secondaryAction?: React.ReactNode;
  /** Set when the person picked "Reply" on an earlier message — shows a cancellable preview above the textarea. */
  replyingTo?: HelpMessageReplyPreview | null;
  onCancelReply?: () => void;
}) {
  const canSubmit = body.trim().length >= MIN_LENGTH && !pending;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>

      {replyingTo && (
        <div className="flex items-start justify-between gap-2 rounded-lg border-l-2 border-primary bg-muted/60 px-2.5 py-1.5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">
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
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={copy.cancelReply}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
      )}

      <textarea
        id={id}
        value={body}
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
        rows={4}
        disabled={pending}
        placeholder={placeholder}
        className={cn(helpTextarea, "min-h-[100px]")}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {secondaryAction}
        <button
          type="button"
          className={helpPrimaryButton}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </div>
  );
}
