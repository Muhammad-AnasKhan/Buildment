"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Loader2 } from "lucide-react";
import { useRef, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export type ButtonClientProps = ButtonPrimitive.Props & {
  loading?: boolean;
  loadingLabel?: string;
};

/** Pending feedback shared by server-action forms and client-side buttons. */
export function ButtonClient({
  children,
  disabled,
  loading = false,
  loadingLabel,
  onClick,
  className,
  ...props
}: ButtonClientProps) {
  const form = useFormStatus();
  const [clickPending, startTransition] = useTransition();
  const clickInFlight = useRef(false);
  const submitting = props.type === "submit" && form.pending;
  // Disable all submitters, but identify the selected action in multi-action forms.
  const selectedSubmitter = !props.name || form.data?.get(props.name) === String(props.value ?? "");
  const busy = loading || clickPending || (submitting && selectedSubmitter);

  return (
    <ButtonPrimitive
      {...props}
      className={cn("relative", className)}
      disabled={disabled || busy || submitting}
      aria-busy={busy || undefined}
      data-loading={busy ? "" : undefined}
      onClick={(event) => {
        if (clickInFlight.current || busy || submitting) {
          event.preventDefault();
          return;
        }
        const result: unknown = onClick?.(event);
        // Async handlers can opt in simply by returning their promise.
        if (result && typeof (result as PromiseLike<unknown>).then === "function") {
          clickInFlight.current = true;
          startTransition(async () => {
            try {
              await result;
            } finally {
              clickInFlight.current = false;
            }
          });
        }
      }}
    >
      {busy ? (
        <span className="inline-grid items-center justify-items-center [gap:inherit]">
          <span className="col-start-1 row-start-1 inline-flex items-center justify-center opacity-0 [gap:inherit]">
            {children}
          </span>
          <span className="col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5" aria-hidden="true">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            {loadingLabel}
          </span>
        </span>
      ) : children}
    </ButtonPrimitive>
  );
}
