"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  BookOpen,
  CalendarClock,
  Mail,
  MessageSquareText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_INFO,
  type NotificationCategory,
  type NotificationPreferences,
} from "@/shared/api/notifications";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/app-toast";
import { ApiError, apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Channel = "inApp" | "email";

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  activity: MessageSquareText,
  course: BookOpen,
  reminder: CalendarClock,
  account: ShieldCheck,
  admin: Bell,
};

/** Per-category channel switches. Each change saves immediately and rolls back if the save fails. */
export function NotificationPreferencesForm({
  initial,
  showAdmin,
}: {
  initial: NotificationPreferences;
  showAdmin: boolean;
}) {
  const [preferences, setPreferences] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const categories = NOTIFICATION_CATEGORIES.filter((category) => category !== "admin" || showAdmin);

  const change = async (category: NotificationCategory, channel: Channel, enabled: boolean) => {
    const previous = preferences;
    setPreferences({ ...preferences, [channel]: { ...preferences[channel], [category]: enabled } });
    setSaving(`${category}:${channel}`);
    try {
      const saved = await apiFetch<NotificationPreferences>("/api/v1/notifications/preferences", {
        method: "PUT",
        json: { [channel]: { [category]: enabled } },
      });
      setPreferences(saved);
    } catch (error) {
      setPreferences(previous);
      toast(error instanceof ApiError ? error.message : "Could not save your notification settings.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mt-5 space-y-3">
      {categories.map((category) => {
        const info = NOTIFICATION_CATEGORY_INFO[category];
        const Icon = CATEGORY_ICON[category];
        const inAppLocked = !info.optional.inApp;
        const emailLocked = !info.optional.email;
        return (
          <article key={category} className="rounded-2xl border bg-background/60 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold tracking-tight">{info.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{info.description}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <ChannelRow
                icon={Bell}
                label="In app"
                description={inAppLocked ? "Always on for account notices" : "Bell and notification center"}
                checked={preferences.inApp[category]}
                disabled={inAppLocked || saving !== null}
                locked={inAppLocked}
                onCheckedChange={(checked) => void change(category, "inApp", checked)}
              />
              <ChannelRow
                icon={Mail}
                label="Email"
                description={emailLocked ? "Always on for account notices" : "Sent to your account email"}
                checked={preferences.email[category]}
                disabled={emailLocked || saving !== null}
                locked={emailLocked}
                onCheckedChange={(checked) => void change(category, "email", checked)}
              />
            </div>
          </article>
        );
      })}
      <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground">
        <BellOff className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Turning a channel off stops new alerts of that kind. Account notices stay on so you never miss access changes.
      </p>
    </div>
  );
}

function ChannelRow({
  icon: Icon,
  label,
  description,
  checked,
  disabled,
  locked,
  onCheckedChange,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  locked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
        locked ? "cursor-default bg-muted/40" : "bg-card hover:border-foreground/30",
        disabled && !locked ? "opacity-60" : null,
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} aria-label={label} />
    </label>
  );
}
