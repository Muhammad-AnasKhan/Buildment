"use client";

import { startTransition, useActionState } from "react";
import type { FormEvent } from "react";
import { signupAction, type SignupState } from "@/server/actions/signup";
import { signupSchema } from "@/shared/lib/auth-validation";
import { zodAuthErrors } from "@/lib/auth-form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthFormErrors } from "@/components/auth/use-auth-form-errors";

const initial: SignupState = { fieldErrors: {}, formError: null };

export function SignupForm({ redirectTo }: { redirectTo?: string | null } = {}) {
  const [state, formAction, pending] = useActionState(signupAction, initial);
  const { errorFor, formError, clearField, setLocalErrors } =
    useAuthFormErrors(state);
  const nameError = errorFor("name");
  const emailError = errorFor("email");
  const passwordError = errorFor("password");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      name: formData.get("name"),
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
    startTransition(() => formAction(formData));
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-[15px]">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          autoComplete="name"
          onChange={() => clearField("name")}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "signup-name-error" : undefined}
        />
        {nameError ? (
          <p id="signup-name-error" className="text-sm text-destructive">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-[15px]">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          onChange={() => clearField("email")}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "signup-email-error" : undefined}
        />
        {emailError ? (
          <p id="signup-email-error" className="text-sm text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-[15px]">
          Password
        </Label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="pr-12"
          onChange={() => clearField("password")}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "signup-password-error" : undefined}
        />
        {passwordError ? (
          <p
            id="signup-password-error"
            className="text-sm text-destructive"
          >
            {passwordError}
          </p>
        ) : null}
      </div>
      {formError ? (
        <p
          role="alert"
          className="border-2 border-destructive bg-card px-3.5 py-3 text-[15px] text-destructive"
        >
          {formError}
        </p>
      ) : null}
      <Button
        type="submit"
        className="w-full"
        disabled={pending}
      >
        {pending ? (
          <>
            <span
              aria-hidden
              className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            <span className="sr-only">Creating account…</span>
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
