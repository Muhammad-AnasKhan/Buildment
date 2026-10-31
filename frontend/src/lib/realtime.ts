"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  REALTIME_EVENT_NAMES,
  type RealtimeEventMap,
  type RealtimeEventName,
} from "@/shared/api/realtime";

// One shared Server-Sent-Events connection per browser tab. Every component that wants
// live updates (the bell, an open chat) subscribes here instead of opening its own stream.
// "connected" turns true only once the server's first event arrives — not on the bare
// HTTP open — so a proxy that buffers the stream counts as disconnected and callers fall
// back to polling.
const STREAM_URL = "/api/v1/events/stream";
const RECONNECT_MS = 3_000;
// The server pings every 10s; this much silence means the stream is dead or buffered.
const SILENCE_LIMIT_MS = 30_000;

type Listener = (payload: unknown) => void;

const listeners = new Map<string, Set<Listener>>();
const connectionWatchers = new Set<() => void>();
let source: EventSource | null = null;
let connected = false;
let subscribers = 0;
let lastEventAt = 0;
let watchdog: number | null = null;
let reconnectTimer: number | null = null;

function setConnected(next: boolean) {
  if (connected === next) return;
  connected = next;
  connectionWatchers.forEach((notify) => notify());
}

function closeStream() {
  source?.close();
  source = null;
  setConnected(false);
}

function scheduleReconnect() {
  if (reconnectTimer !== null || subscribers === 0) return;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    if (subscribers > 0) openStream();
  }, RECONNECT_MS);
}

function openStream() {
  if (source || typeof window === "undefined") return;
  const stream = new EventSource(STREAM_URL);
  source = stream;
  lastEventAt = Date.now();

  stream.addEventListener("ready", () => {
    lastEventAt = Date.now();
    setConnected(true);
  });
  stream.addEventListener("ping", () => {
    lastEventAt = Date.now();
  });
  for (const name of REALTIME_EVENT_NAMES) {
    stream.addEventListener(name, (event) => {
      lastEventAt = Date.now();
      let payload: unknown;
      try {
        payload = JSON.parse((event as MessageEvent<string>).data);
      } catch {
        return;
      }
      listeners.get(name)?.forEach((listener) => listener(payload));
    });
  }
  stream.onerror = () => {
    setConnected(false);
    // The browser retries by itself while CONNECTING; when it gives up (CLOSED, e.g. a
    // 401) we reopen after a pause so a returning session picks the stream back up.
    if (stream.readyState === EventSource.CLOSED) {
      source = null;
      scheduleReconnect();
    }
  };

  if (watchdog === null) {
    watchdog = window.setInterval(() => {
      if (source && Date.now() - lastEventAt > SILENCE_LIMIT_MS) {
        closeStream();
        scheduleReconnect();
      }
    }, 10_000);
  }
}

function releaseStream() {
  if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
  reconnectTimer = null;
  if (watchdog !== null) window.clearInterval(watchdog);
  watchdog = null;
  closeStream();
}

export function subscribeRealtime<K extends RealtimeEventName>(
  event: K,
  handler: (payload: RealtimeEventMap[K]) => void,
): () => void {
  const set = listeners.get(event) ?? new Set<Listener>();
  const listener = handler as Listener;
  set.add(listener);
  listeners.set(event, set);
  subscribers += 1;
  openStream();

  return () => {
    set.delete(listener);
    subscribers -= 1;
    if (subscribers === 0) releaseStream();
  };
}

/** Non-React version of useRealtimeConnected: told whenever the stream goes up or down. */
export function subscribeConnection(
  listener: (connected: boolean) => void,
): () => void {
  const watcher = () => listener(connected);
  connectionWatchers.add(watcher);
  return () => {
    connectionWatchers.delete(watcher);
  };
}

/** Runs `handler` for every `event` the server pushes while the component is mounted. */
export function useRealtimeEvent<K extends RealtimeEventName>(
  event: K,
  handler: (payload: RealtimeEventMap[K]) => void,
) {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });
  useEffect(
    () => subscribeRealtime(event, (payload) => latest.current(payload)),
    [event],
  );
}

/** True while live pushes are really flowing; false means callers should poll instead. */
export function useRealtimeConnected(): boolean {
  return useSyncExternalStore(
    (notify) => {
      connectionWatchers.add(notify);
      return () => {
        connectionWatchers.delete(notify);
      };
    },
    () => connected,
    () => false,
  );
}
