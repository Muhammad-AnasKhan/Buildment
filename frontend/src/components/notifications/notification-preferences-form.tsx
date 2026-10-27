"use client";

import { useState } from "react";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_INFO,
  type NotificationCategory,
  type NotificationPreferences,
} from "@/shared/api/notifications";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/app-toast";
import { ApiError, apiFetch } from "@/lib/api-client";

type Channel = "inApp" | "email";
const CHANNELS: { key: Channel; label: string }[] = [
  { key: "inApp", label: "In app" },
  { key: "email", label: "Email" },
];

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
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-88 text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="pb-2 pr-4 font-medium">
              Notification
            </th>
            {CHANNELS.map((channel) => (
              <th key={channel.key} scope="col" className="w-20 pb-2 text-center font-medium">
                {channel.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {categories.map((category) => {
            const info = NOTIFICATION_CATEGORY_INFO[category];
            return (
              <tr key={category}>
                <th scope="row" className="py-3 pr-4 text-left font-normal">
                  <span className="block font-medium">{info.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{info.description}</span>
                </th>
                {CHANNELS.map((channel) => (
                  <td key={channel.key} className="py-3 text-center">
                    <span className="inline-flex justify-center">
                      <Checkbox
                        checked={preferences[channel.key][category]}
                        disabled={!info.optional[channel.key] || saving !== null}
                        className={info.optional[channel.key] ? undefined : "opacity-50"}
                        onCheckedChange={(checked) => void change(category, channel.key, checked)}
                        aria-label={`${info.label}: ${channel.label}`}
                      />
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
