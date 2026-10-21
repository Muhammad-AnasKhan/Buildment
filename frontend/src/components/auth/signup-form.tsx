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
  const { errorFor, formError, clearField, setLocalErrors } = useAuthFormErrors(state);
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
    <form action={formAction} onSubmit={validateBeforeSubmit} noValidate className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required maxLength={120} autoComplete="name" className="h-10" onChange={() => clearField("name")} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "signup-name-error" : undefined} />
        {nameError ? <p id="signup-name-error" className="text-xs text-destructive">{nameError}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-10"
          onChange={() => clearField("email")}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "signup-email-error" : undefined}
        />
        {emailError ? <p id="signup-email-error" className="text-xs text-destructive">{emailError}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="h-10"
          onChange={() => clearField("password")}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "signup-password-error" : undefined}
        />
        {passwordError ? <p id="signup-password-error" className="text-xs text-destructive">{passwordError}</p> : null}
      </div>
      {formError ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Creating account…" : "Sign up"}
      </Button>
    </form>
  );
}
