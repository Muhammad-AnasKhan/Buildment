"use client";

import { useActionState } from "react";
import { updatePasswordAction, type ProfileUpdateState } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ProfileUpdateState = { ok: false, errors: [] };

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, initial);
  return (
    <form action={action} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Change password</h2>
      <p className="text-sm text-muted-foreground">Use at least 8 characters. Changing your password signs out your other sessions.</p>
      <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} />
      </div>
      {state.ok ? (
        <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">Password updated. Other sessions have been signed out.</p>
      ) : state.errors.length > 0 ? (
        <ul role="alert" className="text-sm text-destructive">{state.errors.map((error) => <li key={error}>{error}</li>)}</ul>
      ) : null}
      <Button type="submit" disabled={pending}>{pending ? "Updating…" : "Update password"}</Button>
    </form>
  );
}
