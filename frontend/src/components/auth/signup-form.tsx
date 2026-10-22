"use client";

import { useActionState } from "react";
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

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initial);
  const { errorFor, formError, clearField, setLocalErrors } =
    useAuthFormErrors(state);
  const nameError = errorFor("name");
  const emailError = errorFor("email");
  const passwordError = errorFor("password");

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      event.preventDefault();
      setLocalErrors(zodAuthErrors(parsed.error));
    } else {
      setLocalErrors({});
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={validateBeforeSubmit}
      noValidate
      className="space-y-3.5"
    >
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-semibold">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          autoComplete="name"
          className="h-12 rounded-xl bg-background px-3.5 dark:bg-background"
          onChange={() => clearField("name")}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "signup-name-error" : undefined}
        />
        {nameError ? (
          <p id="signup-name-error" className="text-[13px] text-destructive">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-12 rounded-xl bg-background px-3.5 dark:bg-background"
          onChange={() => clearField("email")}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "signup-email-error" : undefined}
        />
        {emailError ? (
          <p id="signup-email-error" className="text-[13px] text-destructive">
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
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="h-12 rounded-xl bg-background px-3.5 dark:bg-background pr-11"
          onChange={() => clearField("password")}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "signup-password-error" : undefined}
        />
        {passwordError ? (
          <p
            id="signup-password-error"
            className="text-[13px] text-destructive"
          >
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
        className="h-[50px] w-full rounded-[13px] bg-foreground text-[15px] font-semibold text-background transition-[transform,box-shadow] hover:-translate-y-0.5 hover:bg-foreground hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] disabled:translate-y-0 disabled:opacity-70 motion-reduce:transform-none"
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
