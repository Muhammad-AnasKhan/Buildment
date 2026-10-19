// Services push live events through this module and never touch the transport, so they stay
// testable and the API still works when no realtime layer is running (tests, scripts, jobs-only
// runs). realtime/sse.ts registers the emitter when the HTTP server starts.

type Emitter = (userId: string, event: string, payload: unknown) => void;

let emitter: Emitter | null = null;

export function setRealtimeEmitter(next: Emitter | null): void {
  emitter = next;
}

/** Sends `event` to every live connection of one user (all their tabs and devices). */
export function emitToUser(userId: string, event: string, payload: unknown): void {
  emitter?.(userId, event, payload);
}
