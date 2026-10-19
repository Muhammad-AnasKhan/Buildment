import {
  NOTIFICATION_STREAM_PATH,
  REALTIME_EVENTS,
  type NotificationFeed,
  type NotificationItem,
  type NotificationNewEvent,
  type NotificationReadEvent,
  type NotificationReadResult,
  type RealtimeTicket,
} from "@/shared/api/notifications";
import { ApiError, apiFetch } from "@/lib/api-client";

// One notification feed per tab, shared by every component that shows it (the bell in each
// workspace shell, the /notifications page). The feed is fetched when the first holder mounts and
// again after every stream (re)connect — never on a timer. New notifications arrive over
// Server-Sent Events and are merged by id, so a push that races a fetch, or a reconnect, never
// duplicates a row or a toast.
//
// The stream (a native EventSource) goes through the same-origin Next.js proxy, or straight to the
// API when NEXT_PUBLIC_REALTIME_URL is set. Either way it presents a short-lived ticket, because an
// EventSource cannot send headers and the session cookie is httpOnly on the web origin.

const PAGE_SIZE = 20;
/** A push older than this is shown in the bell but not toasted (it was delivered late). */
const TOAST_MAX_AGE_MS = 60_000;
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000, 60_000];

export type NotificationState = {
  items: NotificationItem[];
  unreadCount: number;
  nextCursor: string | null;
  status: "idle" | "loading" | "ready" | "error";
  connected: boolean;
  loadingMore: boolean;
};

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  nextCursor: null,
  status: "idle",
  connected: false,
  loadingMore: false,
};

let state: NotificationState = initialState;
const listeners = new Set<() => void>();
const toastListeners = new Set<(item: NotificationItem) => void>();
/** Ids already toasted in this tab, so a reconnect or duplicate push never toasts twice. */
const toasted = new Set<string>();

function setState(patch: Partial<NotificationState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotificationState(): NotificationState {
  return state;
}

export function getServerNotificationState(): NotificationState {
  return initialState;
}

/** Called for each live notification worth a toast. Returns an unsubscribe function. */
export function onNotificationToast(listener: (item: NotificationItem) => void): () => void {
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
}

function mergeNewestFirst(incoming: NotificationItem[], existing: NotificationItem[]): NotificationItem[] {
  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => (a.createdAt === b.createdAt ? (a.id < b.id ? 1 : -1) : a.createdAt < b.createdAt ? 1 : -1));
}

// --- Feed -------------------------------------------------------------------------------------

let refreshing: Promise<void> | null = null;

/** Loads the newest page. Concurrent calls share one request. */
export function refreshNotifications(): Promise<void> {
  refreshing ??= (async () => {
    if (state.status === "idle") setState({ status: "loading" });
    try {
      const feed = await apiFetch<NotificationFeed>(`/api/v1/notifications?limit=${PAGE_SIZE}`);
      // Keep older pages the user already loaded; replace everything the first page covers.
      const oldest = feed.items.at(-1)?.createdAt;
      const older = oldest ? state.items.filter((item) => item.createdAt < oldest) : [];
      for (const item of feed.items) toasted.add(item.id);
      setState({
        items: mergeNewestFirst(feed.items, older),
        unreadCount: feed.unreadCount,
        nextCursor: older.length ? state.nextCursor : feed.nextCursor,
        status: "ready",
      });
    } catch {
      setState({ status: state.items.length ? "ready" : "error" });
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

export async function loadMoreNotifications(): Promise<void> {
  if (!state.nextCursor || state.loadingMore) return;
  setState({ loadingMore: true });
  try {
    const feed = await apiFetch<NotificationFeed>(
      `/api/v1/notifications?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(state.nextCursor)}`
    );
    for (const item of feed.items) toasted.add(item.id);
    setState({ items: mergeNewestFirst(feed.items, state.items), nextCursor: feed.nextCursor, unreadCount: feed.unreadCount });
  } finally {
    setState({ loadingMore: false });
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const item = state.items.find((entry) => entry.id === id);
  if (!item || item.readAt) return;
  const readAt = new Date().toISOString();
  setState({
    items: state.items.map((entry) => (entry.id === id ? { ...entry, readAt } : entry)),
    unreadCount: Math.max(0, state.unreadCount - 1),
  });
  try {
    const result = await apiFetch<NotificationReadResult>(`/api/v1/notifications/${encodeURIComponent(id)}/read`, {
      method: "POST",
    });
    setState({ unreadCount: result.unreadCount });
  } catch {
    void refreshNotifications();
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const readAt = new Date().toISOString();
  setState({ items: state.items.map((entry) => (entry.readAt ? entry : { ...entry, readAt })), unreadCount: 0 });
  try {
    await apiFetch<NotificationReadResult>("/api/v1/notifications/read-all", { method: "POST" });
  } catch {
    void refreshNotifications();
  }
}

// --- Live events ------------------------------------------------------------------------------

function handleNew(event: NotificationNewEvent) {
  const { notification } = event;
  const known = state.items.some((item) => item.id === notification.id);
  setState({ items: mergeNewestFirst([notification], state.items), unreadCount: event.unreadCount });

  const fresh = Date.now() - new Date(notification.createdAt).getTime() < TOAST_MAX_AGE_MS;
  const visible = typeof document !== "undefined" && document.visibilityState === "visible";
  if (known || toasted.has(notification.id) || !fresh || !visible) {
    toasted.add(notification.id);
    return;
  }
  toasted.add(notification.id);
  toastListeners.forEach((listener) => listener(notification));
}

function handleRead(event: NotificationReadEvent) {
  const readAt = new Date().toISOString();
  const ids = event.ids === "all" ? null : new Set(event.ids);
  setState({
    items: state.items.map((item) => (item.readAt || (ids && !ids.has(item.id)) ? item : { ...item, readAt })),
    unreadCount: event.unreadCount,
  });
}

/** Direct API host for the stream, or "" to go through the same-origin proxy. */
function realtimeBase(): string {
  return process.env.NEXT_PUBLIC_REALTIME_URL?.trim().replace(/\/$/, "") ?? "";
}

function parseEvent<T>(event: Event): T | null {
  try {
    return JSON.parse((event as MessageEvent<string>).data) as T;
  } catch {
    return null;
  }
}

/**
 * Opens the tab's notification stream and keeps it open. Reconnects are handled here rather than
 * by EventSource's built-in retry, because every attempt needs a fresh ticket (they last two
 * minutes). A 401 on the ticket means the user signed out, so the loop stops.
 */
function connectStream(): () => void {
  let source: EventSource | null = null;
  let retry = 0;
  let retryTimer: number | undefined;
  let stopped = false;

  const scheduleReconnect = () => {
    if (stopped) return;
    const delay = RETRY_DELAYS_MS[Math.min(retry, RETRY_DELAYS_MS.length - 1)];
    retry += 1;
    retryTimer = window.setTimeout(() => void open(), delay);
  };

  const open = async () => {
    let ticket: RealtimeTicket;
    try {
      ticket = await apiFetch<RealtimeTicket>("/api/v1/notifications/realtime-ticket", { method: "POST" });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) scheduleReconnect();
      return;
    }
    if (stopped) return;

    const stream = new EventSource(
      `${realtimeBase()}${NOTIFICATION_STREAM_PATH}?ticket=${encodeURIComponent(ticket.token)}`
    );
    source = stream;
    stream.onopen = () => {
      retry = 0;
      setState({ connected: true });
      // Catch up on anything that arrived while disconnected.
      void refreshNotifications();
    };
    stream.addEventListener(REALTIME_EVENTS.notificationNew, (event) => {
      const payload = parseEvent<NotificationNewEvent>(event);
      if (payload) handleNew(payload);
    });
    stream.addEventListener(REALTIME_EVENTS.notificationRead, (event) => {
      const payload = parseEvent<NotificationReadEvent>(event);
      if (payload) handleRead(payload);
    });
    stream.onerror = () => {
      stream.close();
      if (source === stream) source = null;
      setState({ connected: false });
      scheduleReconnect();
    };
  };

  void open();

  return () => {
    stopped = true;
    window.clearTimeout(retryTimer);
    source?.close();
    source = null;
    setState({ connected: false });
  };
}

// --- Lifetime: one connection per tab, shared by every layout that mounts it --------------------

let stopStream: (() => void) | null = null;
let holders = 0;
let stopTimer: number | undefined;

/**
 * Starts the tab's feed and stream (or joins the running ones) and returns a release function.
 * Release is deferred briefly so moving between layouts (learn ↔ teach) keeps one connection.
 */
export function acquireNotificationCenter(): () => void {
  if (stopTimer !== undefined) {
    window.clearTimeout(stopTimer);
    stopTimer = undefined;
  }
  holders += 1;
  if (!stopStream) {
    void refreshNotifications();
    stopStream = connectStream();
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    holders -= 1;
    if (holders > 0) return;
    stopTimer = window.setTimeout(() => {
      stopTimer = undefined;
      stopStream?.();
      stopStream = null;
      state = initialState;
      toasted.clear();
    }, 1_000);
  };
}
