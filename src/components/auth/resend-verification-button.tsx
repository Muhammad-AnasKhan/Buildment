"use client";

import { useState, useTransition } from "react";
import { resendVerificationEmailAction } from "@/server/actions/resend-verification";
import { Button } from "@/components/ui/button";

export function ResendVerificationButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await resendVerificationEmailAction();
            setMessage(result.message);
          });
        }}
      >
        {pending ? "Sending…" : "Resend verification email"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
