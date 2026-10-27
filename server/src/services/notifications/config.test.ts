import { describe, expect, it } from "vitest";
import { NOTIFICATION_TYPES } from "../../shared/api/notifications.js";
import { NOTIFICATION_CHANNELS, channelEnabled } from "./config.js";
import { isRetryableFailure, retryDelayMs, withPreferencesFooter } from "./email-outbox.js";

describe("notification channel config", () => {
  it("configures every notification type", () => {
    expect(Object.keys(NOTIFICATION_CHANNELS).sort()).toEqual([...NOTIFICATION_TYPES].sort());
  });

  it("honours opt-outs for optional categories only", () => {
    const optedOut = { emailOptOut: ["activity", "account"], inAppOptOut: ["reminder"] };
    expect(channelEnabled("help.reply", "email", optedOut)).toBe(false);
    expect(channelEnabled("help.reply", "inApp", optedOut)).toBe(true);
    expect(channelEnabled("study.reminder", "inApp", optedOut)).toBe(false);
    // Account notices cannot be switched off.
    expect(channelEnabled("instructor.decision", "email", optedOut)).toBe(true);
    // A channel the event does not use stays off whatever the preferences say.
    expect(channelEnabled("course.learner_completed", "email", null)).toBe(false);
  });
});

describe("email outbox policy", () => {
  it("backs off between attempts", () => {
    expect([1, 2, 3, 4, 5].map(retryDelayMs)).toEqual([60_000, 300_000, 1_800_000, 7_200_000, 7_200_000]);
  });

  it("retries transient failures and gives up on permanent ones", () => {
    expect(isRetryableFailure({ thrown: true })).toBe(true);
    expect(isRetryableFailure({ sent: false, reason: "api-error", status: 429 })).toBe(true);
    expect(isRetryableFailure({ sent: false, reason: "api-error", status: 503 })).toBe(true);
    expect(isRetryableFailure({ sent: false, reason: "api-error", status: 422 })).toBe(false);
    expect(isRetryableFailure({ sent: false, reason: "no-api-key" })).toBe(false);
  });

  it("adds a settings link to both email bodies", () => {
    const content = withPreferencesFooter({ subject: "S", html: "<p>Hi</p>", text: "Hi" });
    expect(content.html).toContain("/notifications");
    expect(content.text).toContain("/notifications");
    expect(content.subject).toBe("S");
  });
});
