// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { HelpThreadStatus } from "../domain/enums";
import type { HelpMessageView } from "./help";

// Wire contract for GET /api/v1/events/stream (Server-Sent Events). One stream per
// browser; the server pushes only to the signed-in user it belongs to.

export type RealtimeEventMap = {
  /** A new chat message in a thread the user takes part in. */
  "help-message": { threadId: string; message: HelpMessageView };
  /** Delivery receipt for messages this user wrote: the other side received or saw them. */
  "help-status": { threadId: string; messageIds: string[]; status: "delivered" | "seen"; at: string };
  /** The thread itself changed (for example the mentor resolved it). */
  "help-thread": { threadId: string; status: HelpThreadStatus };
};

export type RealtimeEventName = keyof RealtimeEventMap;

export const REALTIME_EVENT_NAMES: RealtimeEventName[] = [
  "help-message",
  "help-status",
  "help-thread",
];
