import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { openStreamCount, startRealtime } from "../../src/realtime/sse.js";
import { notify } from "../../src/services/notifications/service.js";
import {
  NOTIFICATION_STREAM_PATH,
  REALTIME_EVENTS,
  type NotificationNewEvent,
  type NotificationReadEvent,
} from "../../src/shared/api/notifications.js";
import { SESSION_COOKIE_NAME } from "../../src/shared/api/auth.js";
import { createCourseFixture } from "../helpers/fixtures.js";

// Server-Sent Events end to end: a real HTTP server on a random port, real streaming connections
// (fetch reading the body as it arrives), real sessions.

const app = createApp();
const server = http.createServer(app);
let stopRealtime: () => void;
let url = "";
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken = "";
const streams: Stream[] = [];

beforeAll(async () => {
  fx = await createCourseFixture();
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
  stopRealtime = startRealtime();
  await new Promise<void>((resolve) => server.listen(0, resolve));
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(async () => {
  for (const stream of streams) stream.close();
  stopRealtime();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await fx.cleanup();
});

type SseEvent = { event: string; data: unknown };
type Stream = {
  status: number;
  contentType: string | null;
  cacheControl: string | null;
  /** Resolves with the next frame named `event` (comments and other events are skipped). */
  next<T>(event: string, timeoutMs?: number): Promise<T>;
  received: SseEvent[];
  raw: () => string;
  close: () => void;
};

/** Opens the stream and parses SSE frames as they arrive. */
async function open(options: { ticket?: string; headers?: Record<string, string>; origin?: string } = {}): Promise<Stream> {
  const controller = new AbortController();
  const query = options.ticket ? `?ticket=${encodeURIComponent(options.ticket)}` : "";
  const response = await fetch(`${url}${NOTIFICATION_STREAM_PATH}${query}`, {
    headers: { Accept: "text/event-stream", ...(options.origin ? { Origin: options.origin } : {}), ...options.headers },
    signal: controller.signal,
  });

  const received: SseEvent[] = [];
  const waiters: { event: string; resolve: (data: unknown) => void }[] = [];
  let buffer = "";
  let raw = "";

  const dispatch = (frame: string) => {
    let event = "message";
    const data: string[] = [];
    for (const line of frame.split("\n")) {
      if (line.startsWith("event: ")) event = line.slice(7);
      else if (line.startsWith("data: ")) data.push(line.slice(6));
    }
    if (data.length === 0) return;
    const parsed = { event, data: JSON.parse(data.join("\n")) as unknown };
    received.push(parsed);
    const index = waiters.findIndex((waiter) => waiter.event === event);
    if (index !== -1) waiters.splice(index, 1)[0]!.resolve(parsed.data);
  };

  if (response.ok && response.body) {
    void (async () => {
      const decoder = new TextDecoder();
      try {
        for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
          const text = decoder.decode(chunk, { stream: true });
          raw += text;
          buffer += text;
          let end: number;
          while ((end = buffer.indexOf("\n\n")) !== -1) {
            dispatch(buffer.slice(0, end));
            buffer = buffer.slice(end + 2);
          }
        }
      } catch {
        // aborted by close()
      }
    })();
  } else {
    await response.text();
  }

  const stream: Stream = {
    status: response.status,
    contentType: response.headers.get("content-type"),
    cacheControl: response.headers.get("cache-control"),
    received,
    raw: () => raw,
    next: <T>(event: string, timeoutMs = 2_000) =>
      new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`no ${event} within ${timeoutMs}ms`)), timeoutMs);
        waiters.push({
          event,
          resolve: (data) => {
            clearTimeout(timer);
            resolve(data as T);
          },
        });
      }),
    close: () => controller.abort(),
  };
  streams.push(stream);
  return stream;
}

const until = async (condition: () => boolean, timeoutMs = 2_000) => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error("condition not met in time");
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
};

const ping = (userId: string, key: string) =>
  notify({ type: "enrollment.created", recipients: [{ userId }], dedupeKey: `rt-${fx.tag}-${key}`, title: key, body: "" });

const ticketFor = async (token: string) =>
  (await request(app).post("/api/v1/notifications/realtime-ticket").set({ Authorization: `Bearer ${token}` })).body.data
    .token as string;

describe("realtime notifications (SSE)", () => {
  it("refuses a stream without a valid session", async () => {
    expect((await open()).status).toBe(401);
    expect((await open({ ticket: "not-a-ticket" })).status).toBe(401);
    expect((await open({ headers: { Authorization: "Bearer nope" } })).status).toBe(401);
    expect((await open({ headers: { Cookie: `${SESSION_COOKIE_NAME}=nope` } })).status).toBe(401);
  });

  it("opens an event stream that proxies will not buffer", async () => {
    const stream = await open({ headers: { Authorization: `Bearer ${fx.learnerToken}` } });
    expect(stream.status).toBe(200);
    expect(stream.contentType).toMatch(/^text\/event-stream/);
    expect(stream.cacheControl).toContain("no-transform");
    await until(() => stream.raw().includes("retry: 5000"));
    stream.close();
  });

  it("delivers a new notification only to its owner, on every connection they have", async () => {
    const learnerByTicket = await open({ ticket: await ticketFor(fx.learnerToken) });
    const learnerByCookie = await open({ headers: { Cookie: `${SESSION_COOKIE_NAME}=${fx.learnerToken}` } });
    const mentorByBearer = await open({ headers: { Authorization: `Bearer ${mentorToken}` } });
    expect([learnerByTicket.status, learnerByCookie.status, mentorByBearer.status]).toEqual([200, 200, 200]);
    await until(() => openStreamCount(fx.learner.id) >= 2 && openStreamCount(fx.mentor.id) >= 1);

    const viaTicket = learnerByTicket.next<NotificationNewEvent>(REALTIME_EVENTS.notificationNew);
    const viaCookie = learnerByCookie.next<NotificationNewEvent>(REALTIME_EVENTS.notificationNew);

    await ping(fx.learner.id, "first");

    const [a, b] = await Promise.all([viaTicket, viaCookie]);
    expect(a.notification).toMatchObject({ title: "first", type: "enrollment.created", readAt: null });
    expect(a.unreadCount).toBe(1);
    expect(b.notification.id).toBe(a.notification.id);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(mentorByBearer.received.some((event) => event.event === REALTIME_EVENTS.notificationNew)).toBe(false);

    // Reading in one tab updates the others.
    const synced = learnerByCookie.next<NotificationReadEvent>(REALTIME_EVENTS.notificationRead);
    await request(app).post(`/api/v1/notifications/${a.notification.id}/read`).set({ Authorization: `Bearer ${fx.learnerToken}` });
    expect(await synced).toEqual({ ids: [a.notification.id], unreadCount: 0 });

    learnerByTicket.close();
    learnerByCookie.close();
    mentorByBearer.close();
  });

  it("forgets a connection once the client goes away", async () => {
    // Streams closed by the previous test finish closing first.
    await until(() => openStreamCount(fx.learner.id) === 0);
    const stream = await open({ headers: { Authorization: `Bearer ${fx.learnerToken}` } });
    await until(() => openStreamCount(fx.learner.id) === 1);
    stream.close();
    await until(() => openStreamCount(fx.learner.id) === 0);
  });

  it("closes every stream on shutdown, so the HTTP server can stop", async () => {
    const stream = await open({ headers: { Authorization: `Bearer ${fx.learnerToken}` } });
    await until(() => openStreamCount() >= 1);
    stopRealtime();
    expect(openStreamCount()).toBe(0);
    await until(() => stream.raw().length > 0);
    stopRealtime = startRealtime();
  });

  it("lets a client that was offline catch up from the feed after reconnecting", async () => {
    const stream = await open({ headers: { Authorization: `Bearer ${fx.learnerToken}` } });
    stream.close();

    await ping(fx.learner.id, "while-offline");

    const again = await open({ headers: { Authorization: `Bearer ${fx.learnerToken}` } });
    expect(again.status).toBe(200);
    const feed = await request(app).get("/api/v1/notifications").set({ Authorization: `Bearer ${fx.learnerToken}` });
    expect(feed.body.data.items[0]).toMatchObject({ title: "while-offline", readAt: null });
    expect(feed.body.data.unreadCount).toBe(1);
    again.close();
  });

  it("refuses a ticket whose session has signed out", async () => {
    const session = await createSession(fx.learner.id);
    const ticket = await ticketFor(session.sessionToken);
    await prisma.session.delete({ where: { sessionToken: session.sessionToken } });

    expect((await open({ ticket })).status).toBe(401);
  });

  it("allows the web app's origin to open the stream directly, and refuses unknown origins", async () => {
    const ticket = await ticketFor(fx.learnerToken);
    const allowed = await open({ ticket, origin: "http://localhost:3000" });
    expect(allowed.status).toBe(200);
    allowed.close();
    expect((await open({ ticket: await ticketFor(fx.learnerToken), origin: "https://evil.example" })).status).toBe(500);
  });
});
