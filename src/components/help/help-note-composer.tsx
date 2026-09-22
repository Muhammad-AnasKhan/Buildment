"use client";

import { Loader2 } from "lucide-react";
import { helpPrimaryButton, helpTextarea } from "./help-styles";
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
}) {
  const canSubmit = body.trim().length >= MIN_LENGTH && !pending;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-neutral-900">
          {label}
        </label>
        {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      </div>
      <textarea
        id={id}
        value={body}
        onChange={(event) => onBodyChange(event.target.value)}
        rows={4}
        disabled={pending}
        placeholder={placeholder}
        className={cn(helpTextarea, "min-h-[100px]")}
      />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {secondaryAction}
        <button type="button" className={helpPrimaryButton} disabled={!canSubmit} onClick={onSubmit}>
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
