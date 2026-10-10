"use client";

import { useState, useTransition } from "react";
import { resendVerificationEmailAction } from "@/server/actions/resend-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResendVerificationButton({ signedIn = false }: { signedIn?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 text-left"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await resendVerificationEmailAction(signedIn ? undefined : formData);
          setMessage(result.message);
        });
      }}
    >
      {signedIn ? null : (
        <Input
          name="email"
          type="email"
          required
          placeholder="Email address"
          aria-label="Email address"
          className="h-10"
        />
      )}
      <Button type="submit" variant="outline" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Resend verification email"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
