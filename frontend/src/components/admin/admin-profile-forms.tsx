"use client";

import { useActionState } from "react";
import { updateAdminProfileAction, updateAdminPasswordAction, type AdminProfileState } from "@/server/actions/admin/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AdminProfileState = { ok: false, message: "" };

function Feedback({ state }: { state: AdminProfileState }) {
  return state.message ? <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-emerald-600 dark:text-emerald-400" : "text-sm text-destructive"}>{state.message}</p> : null;
}

export function AdminProfileForms({ name, email }: { name: string; email: string }) {
  const [profile, saveProfile, savingProfile] = useActionState(updateAdminProfileAction, initial);
  const [password, savePassword, savingPassword] = useActionState(updateAdminPasswordAction, initial);
  return <div className="space-y-6">
    <form action={saveProfile} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Account details</h2>
      <div className="space-y-2"><Label htmlFor="admin-name">Name</Label><Input id="admin-name" name="name" autoComplete="name" defaultValue={name} required maxLength={120} /></div>
      <div className="space-y-2"><Label htmlFor="admin-email">Email</Label><Input id="admin-email" name="email" type="email" autoComplete="email" defaultValue={email} required /></div>
      <div className="space-y-2"><Label htmlFor="profile-password">Current password</Label><Input id="profile-password" name="currentPassword" type="password" autoComplete="current-password" maxLength={128} aria-describedby="email-password-help" /><p id="email-password-help" className="text-xs text-muted-foreground">Required only when changing your email. Use the new email the next time you sign in.</p></div>
      <Feedback state={profile} />
      <Button disabled={savingProfile} type="submit">{savingProfile ? "Saving…" : "Save profile"}</Button>
    </form>
    <form action={savePassword} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Change password</h2>
      <p className="text-sm text-muted-foreground">Use at least 8 characters. Other sessions will be signed out after this change.</p>
      <div className="space-y-2"><Label htmlFor="current-password">Current password</Label><Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} /></div>
      <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></div>
      <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></div>
      <Feedback state={password} />
      <Button disabled={savingPassword} type="submit">{savingPassword ? "Updating…" : "Update password"}</Button>
    </form>
  </div>;
}
