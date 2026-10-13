"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileUpdateState } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ProfileUpdateState = { ok: false, errors: [] };

export function ProfileForm({
  email,
  initial: values,
  variant = "card",
}: {
  email: string;
  initial: { name: string; timezone: string; skills: string };
  variant?: "card" | "plain";
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initial);

  return (
    <form
      action={formAction}
      className={
        variant === "card"
          ? "space-y-4 rounded-xl border bg-card p-6 shadow-sm"
          : "space-y-4"
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} readOnly disabled className="h-10 bg-muted/50" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={values.name} required className="h-10" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="timezone">Timezone</Label>
        <Input
          id="timezone"
          name="timezone"
          defaultValue={values.timezone}
          placeholder="e.g. America/New_York"
          required
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="skills">Skills (optional)</Label>
        <Input
          id="skills"
          name="skills"
          defaultValue={values.skills}
          placeholder="TypeScript, React, Node.js"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">Comma-separated. Stored for future personalization.</p>
      </div>
      {state.ok === false && state.errors.length > 0 ? (
        <ul className="text-sm text-destructive">{state.errors.map((e) => <li key={e}>{e}</li>)}</ul>
      ) : null}
      {state.ok === true ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Profile saved.</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
