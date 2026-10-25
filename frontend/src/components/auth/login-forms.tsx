"use client";

import { startTransition, useActionState } from "react";
import type { FormEvent } from "react";
import { signInWithPasswordAction } from "@/server/actions/sign-in-credentials";
import { sendMagicLinkAction } from "@/server/actions/magic-link";
import { authEmailSchema, loginSchema } from "@/shared/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { zodAuthErrors, type AuthFormState } from "@/lib/auth-form-state";
import { useAuthFormErrors } from "@/components/auth/use-auth-form-errors";

const initial: AuthFormState = { fieldErrors: {}, formError: null };

export function PasswordLoginForm({
  redirectTo,
  defaultEmail,
}: {
  redirectTo?: string | null;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState(
    signInWithPasswordAction,
    initial,
  );
  const { errorFor, formError, clearField, setLocalErrors } =
    useAuthFormErrors(state);
  const emailError = errorFor("email");
  const passwordError = errorFor("password");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setLocalErrors(zodAuthErrors(parsed.error));
      return;
    }
    setLocalErrors({});
    // Calling the action directly keeps what was typed: a form action resets the
    // fields when it settles, even when it returns an error.
    startTransition(() => action(formData));
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-3.5"
    >
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="h-12 rounded-xl bg-background px-3.5 dark:bg-background"
          defaultValue={defaultEmail ?? ""}
          onChange={() => clearField("email")}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "login-email-error" : undefined}
        />
        {emailError ? (
          <p id="login-email-error" className="text-[13px] text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-semibold">
          Password
        </Label>
        <PasswordInput
          id="password"
          name="password"
          required
          maxLength={128}
          autoComplete="current-password"
          className="h-12 rounded-xl bg-background px-3.5 dark:bg-background pr-11"
          onChange={() => clearField("password")}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "login-password-error" : undefined}
        />
        {passwordError ? (
          <p id="login-password-error" className="text-[13px] text-destructive">
            {passwordError}
          </p>
        ) : null}
      </div>
      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-[50px] w-full cursor-pointer rounded-[13px] bg-foreground text-[15px] font-semibold text-background transition-[transform,box-shadow] hover:-translate-y-0.5 hover:bg-foreground hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] disabled:translate-y-0 disabled:opacity-70 motion-reduce:transform-none"
        disabled={pending}
      >
        {pending ? (
          <>
            <span
              aria-hidden
              className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            <span className="sr-only">Signing in…</span>
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}

export function MagicLinkForm({ redirectTo }: { redirectTo?: string | null }) {
  const [state, action, pending] = useActionState(sendMagicLinkAction, initial);
  const { errorFor, formError, clearField, setLocalErrors } =
    useAuthFormErrors(state);
  const emailError = errorFor("email");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = authEmailSchema.safeParse(formData.get("email"));
    if (!parsed.success) {
      setLocalErrors({
        email: parsed.error.issues[0]?.message ?? "Enter a valid email",
      });
      return;
    }
    setLocalErrors({});
    startTransition(() => action(formData));
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-3.5"
    >
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      <div className="space-y-1.5">
        <Label htmlFor="magic-email" className="text-sm font-semibold">
          Email for magic link
        </Label>
        <Input
          id="magic-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="h-12 rounded-xl bg-background px-3.5 dark:bg-background"
          onChange={() => clearField("email")}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "magic-email-error" : undefined}
        />
        {emailError ? (
          <p id="magic-email-error" className="text-[13px] text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>
      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-[50px] w-full rounded-[13px] cursor-pointer bg-foreground text-[15px] font-semibold text-background transition-[transform,box-shadow] hover:-translate-y-0.5 hover:bg-foreground hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] disabled:translate-y-0 disabled:opacity-70 motion-reduce:transform-none"
        disabled={pending}
      >
        {pending ? (
          <>
            <span
              aria-hidden
              className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            <span className="sr-only">Sending…</span>
          </>
        ) : (
          "Send magic link"
        )}
      </Button>
    </form>
  );
}
