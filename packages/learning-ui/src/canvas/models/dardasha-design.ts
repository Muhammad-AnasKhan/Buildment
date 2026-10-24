import type { DesignFlow, DesignSpec, DesignStep } from "./design-stepper";
import type { Tone } from "../primitives/tones";
import { withCommas } from "./picture-controls";
import {
  CHAT_SERVERS,
  GATEWAY_PLAN,
  GATEWAYS,
  OFFLINE_SHARE,
  OPEN_LINES,
  PEAK_DELIVERIES,
  PEAK_MESSAGES,
  PRESENCE_CHANGES,
  REGISTRY_PLAN,
  STORE_PLAN,
} from "./dardasha-numbers";

// 22.2 "Step through the design at peak". Dardasha's design grows one block at a
// time while a pill on the block under stress says how many times its plan it
// carries. Pure data for the house design stepper (models/design-stepper.ts).
//
//   one box lines       = 3,000,000 against a plan of 50,000   (60 times)
//   gateways            = ceil(3,000,000 / 50,000) = 60
//   chat servers        = ceil(13,889 / 2,000) = 7
//   store, one node     = 13,889 writes a second against 2,500 (5.6 times)
//   per partition       = 13,889 / k against 2,500
//   registry            = 41,667 lookups + 3,125 writes = 44,792 against 50,000 per node
//   push jobs           = 41,667 x 10% = 4,167 a second

export const PARTITION_CHOICES: readonly number[] = [4, 6, 8];
export const PARTITIONS_DEFAULT = 8;

export const REGISTRY_OPERATIONS = PEAK_DELIVERIES + PRESENCE_CHANGES;
export const PUSH_JOBS = Math.round(PEAK_DELIVERIES * OFFLINE_SHARE);

/** Tone of a block by how many times its plan it carries: above 1 bad, 0.8 to 1 warn, below 0.8 good. */
export function planTone(times: number): Tone {
  return times > 1 ? "bad" : times >= 0.8 ? "warn" : "good";
}

export type DesignNumbers = {
  /** The load on the block that step stresses, per second (lines in step 1). */
  load: number;
  /** Times the plan of one node. */
  timesPlan: number;
};

/** The numbers of the block under stress at a step (1 to 5); k is the partition count of step 3. */
export function designNumbers(step: number, k: number = PARTITIONS_DEFAULT): DesignNumbers {
  if (step <= 1) return { load: OPEN_LINES, timesPlan: OPEN_LINES / GATEWAY_PLAN };
  if (step === 2) return { load: PEAK_MESSAGES, timesPlan: PEAK_MESSAGES / STORE_PLAN };
  if (step === 3) {
    const load = PEAK_MESSAGES / Math.max(1, k);
    return { load, timesPlan: load / STORE_PLAN };
  }
  if (step === 4) return { load: REGISTRY_OPERATIONS, timesPlan: REGISTRY_OPERATIONS / REGISTRY_PLAN };
  return { load: PUSH_JOBS, timesPlan: PUSH_JOBS / REGISTRY_PLAN };
}

/** "60x its plan" from 10 times, "5.6x its plan" above 1, "93% of plan" at or below 1. At most 15 characters. */
export function planText(times: number): string {
  if (times >= 10) return `${Math.round(times)}x its plan`;
  return times > 1 ? `${(Math.round(times * 10) / 10).toFixed(1)}x its plan` : `${Math.round(times * 100)}% of plan`;
}

/** The verdict for step 3 with k partitions. */
export function partitionVerdict(k: number): { text: string; tone: Tone } {
  const times = designNumbers(3, k).timesPlan;
  if (times > 1) return { text: `Still ${(Math.round(times * 10) / 10).toFixed(1)}x one node's plan`, tone: "bad" };
  if (times >= 0.8) return { text: `Tight: ${Math.round(times * 100)}% of one node's plan`, tone: "warn" };
  return { text: "Each partition has room", tone: "good" };
}

const X = [70, 205, 340] as const;
const ROW_A = 96;
const ROW_B = 200;
const ROW_C = 300;

const BUSY: DesignFlow = { path: ["phones", "gateways", "chat", "store"], tone: "accent" };

/** The design stepper data for Dardasha with k partitions chosen in step 3. */
export function dardashaDesign(k: number = PARTITIONS_DEFAULT): DesignSpec {
  const n3 = designNumbers(3, k);
  const tone3 = planTone(n3.timesPlan);
  const each = withCommas(Math.round(n3.load));

  const steps: DesignStep[] = [
    {
      id: "one-box",
      title: "One box",
      patch: {
        actors: [
          { id: "phones", label: "Phones", kind: "phone", x: X[0], y: ROW_A },
          { id: "chat", label: "One server", kind: "server", x: X[1], y: ROW_B },
        ],
        links: [{ id: "phones-chat", from: "phones", to: "chat" }],
        tags: [{ id: "lines", text: `${withCommas(OPEN_LINES)} lines`, x: X[1], y: 252, tone: "accent" }],
        status: { chat: { text: planText(designNumbers(1).timesPlan), tone: "bad" } },
        flows: [{ path: ["phones", "chat"], tone: "bad" }],
        mark: { chat: "bad" },
      },
      verdict: { text: "One server holds 60 times its plan", tone: "bad" },
      says: "One box holds the lines, the rules and the storage. At peak it carries 3,000,000 lines against a plan of 50,000.",
      hint: "Tap Next, or tap any step above.",
    },
    {
      id: "gateways",
      title: "Gateways",
      patch: {
        actors: [
          { id: "gateways", label: "Gateways", kind: "router", x: X[1], y: ROW_A },
          { id: "chat", label: "Chat", kind: "server", x: X[1], y: ROW_B },
          { id: "store", label: "Store", kind: "database", x: X[2], y: ROW_B },
        ],
        links: [
          { id: "phones-gateways", from: "phones", to: "gateways" },
          { id: "gateways-chat", from: "gateways", to: "chat" },
          { id: "chat-store", from: "chat", to: "store" },
        ],
        remove: ["phones-chat", "lines"],
        tags: [{ id: "load", text: `${withCommas(PEAK_MESSAGES)} writes /s`, x: X[2], y: 252, tone: "bad" }],
        status: {
          gateways: { text: `${GATEWAYS} gateways`, tone: "good" },
          chat: { text: `${CHAT_SERVERS} servers`, tone: "good" },
          store: { text: planText(designNumbers(2).timesPlan), tone: "bad" },
        },
        flows: [{ ...BUSY, tone: "bad" }],
        mark: { store: "bad" },
      },
      verdict: { text: "Lines fit; the store is 5.6x its plan", tone: "warn" },
      says: "60 gateways hold the 3,000,000 lines and 7 chat servers handle 13,889 messages a second. The store still takes all 13,889 writes, against a plan of 2,500.",
      hint: "More servers fix the lines, not the store.",
    },
    {
      id: "split",
      title: "Split store",
      patch: {
        status: { store: { text: planText(n3.timesPlan), tone: tone3 } },
        remove: ["load"],
        tags: [{ id: "each", text: `${each} /s each`, x: X[2], y: 276, tone: tone3 }],
        flows: [{ ...BUSY, tone: tone3 === "bad" ? "bad" : "accent" }],
        mark: { store: tone3 },
      },
      verdict: partitionVerdict(k),
      says: `A hash of the conversation id picks the partition. 13,889 / ${k} = ${each} writes a second each, against a plan of 2,500.`,
      hint: "Tap 4, 6 or 8 partitions in the picture.",
    },
    {
      id: "registry",
      title: "Registry",
      patch: {
        actors: [{ id: "registry", label: "Registry", kind: "cache", x: X[2], y: ROW_A }],
        links: [
          { id: "chat-registry", from: "chat", to: "registry" },
          { id: "gateways-registry", from: "gateways", to: "registry" },
        ],
        remove: ["each"],
        tags: [{ id: "nodes", text: "2 nodes", x: 366, y: 142, tone: "good" }],
        status: { registry: { text: "45% each", tone: "good" } },
        flows: [BUSY, { path: ["chat", "registry"], tone: "accent", label: "lookup", offset: 0.4 }],
        mark: { registry: "good" },
      },
      verdict: { text: "Lookups fit on two registry nodes", tone: "good" },
      says: "Every delivery looks up the registry and every status change writes to it: 41,667 + 3,125 = 44,792 operations a second. One node plans 50,000, so two nodes run at 45% each.",
      hint: "One lookup for every recipient of every message.",
    },
    {
      id: "notifier",
      title: "Notifier",
      patch: {
        actors: [
          { id: "queue", label: "Push queue", kind: "queue", x: X[1], y: ROW_C },
          { id: "notifier", label: "Notifier", kind: "worker", x: X[0], y: ROW_C },
        ],
        links: [
          { id: "chat-queue", from: "chat", to: "queue" },
          { id: "queue-notifier", from: "queue", to: "notifier" },
          { id: "notifier-phones", from: "notifier", to: "phones" },
        ],
        remove: ["nodes"],
        tags: [{ id: "tenth", text: "10% of sends", x: X[2], y: ROW_C, tone: "accent" }],
        status: {
          queue: { text: `${withCommas(PUSH_JOBS)} jobs /s`, tone: "accent" },
          notifier: { text: "sends pushes", tone: "accent" },
        },
        flows: [BUSY, { path: ["chat", "registry"], tone: "accent", offset: 0.4 }, { path: ["chat", "queue", "notifier", "phones"], tone: "warn", label: "push", offset: 0.2 }],
        mark: { queue: "accent", notifier: "accent" },
      },
      verdict: { text: "Off-line phones go through a queue", tone: "good" },
      says: "The 10% of deliveries that find a phone off become jobs: 4,167 a second. The queue and the notifier carry them. Every other block is unchanged.",
      hint: "A third path leaves the chat server for the queue.",
    },
  ];

  return { width: 420, height: 345, steps };
}

/** Positions the canvas needs to draw the partitions under the store card. */
export const PARTITION_ROW = { centerX: X[2], y: 252, size: 14, gap: 4 } as const;
export const CHOICE_ROW_Y = 314;
