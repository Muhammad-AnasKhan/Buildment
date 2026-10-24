import type { Tone } from "../../primitives/tones";
import type { Scene, SceneEvent } from "./types";

// What a scene looks like at one moment. Pure, so a test can ask "at 3.2 s,
// where is the message and what does Bob say?" without a browser.

export type ActorState = { id: string; label: string; sub: string; tone?: Tone; mark?: Tone; x: number; y: number; subOpacity: number; previousSub?: string; previousTone?: Tone; markOpacity: number; arrival: number };
export type PacketState = { id: string; from: string; to: string; x: number; y: number; label: string; tone: Tone; opacity: number; trail: { x: number; y: number }[]; progress: number };
export type TagState = { row: 0 | 1; value: number; label: string; tone: Tone; opacity: number };
export type WaitState = { actor: string; progress: number; label: string; opacity: number };
export type LineState = { value: number; label: string; opacity: number };
export type SceneFrame = {
  actors: ActorState[];
  packets: PacketState[];
  tags: TagState[];
  lines: LineState[];
  waits: WaitState[];
  verdict: { text: string; tone: Tone } | null;
  verdictOpacity: number;
  /** Only event layers fade at the loop boundary; the picture stays in place. */
  opacity: number;
};

const clamp01 = (p: number) => Math.max(0, Math.min(1, p));
export const ease = (p: number) => { const t = clamp01(p); return t * t * (3 - 2 * t); };
export const FADE_SECONDS = 0.22;
export const fadeIn = (age: number) => ease(age / FADE_SECONDS);

/** The time inside the loop for clock time t. Past the end means "show the final frame". */
export function loopTime(scene: Scene, t: number): number {
  if (!Number.isFinite(t) || t >= 1e5) return scene.loop;
  const loop = Math.max(scene.loop, 0.001);
  return ((t % loop) + loop) % loop;
}

export function sceneFrame(scene: Scene, t: number): SceneFrame {
  const byId = new Map(scene.actors.map((a) => [a.id, a]));
  const actors = new Map<string, ActorState>(
    scene.actors.map((a) => [a.id, { id: a.id, label: a.label, sub: a.sub ?? "", x: a.x, y: a.y, subOpacity: 1, markOpacity: 0, arrival: 0 }])
  );
  const packets: PacketState[] = [];
  const tags: TagState[] = [];
  const lines: LineState[] = [];
  const waits: WaitState[] = [];
  let verdict: SceneFrame["verdict"] = null;
  let verdictOpacity = 0;

  // Events apply in time order; later "say" and "verdict" events win.
  const events = [...scene.events].sort((a, b) => a.at - b.at);
  for (const event of events) {
    if (event.at > t) continue;
    applyEvent(event, t, { byId, actors, packets, tags, lines, waits, setVerdict: (v) => { verdict = v; verdictOpacity = fadeIn(t - event.at); } });
  }
  const opacity = t >= scene.loop ? 1 : fadeIn(scene.loop - t);
  return { actors: [...actors.values()], packets, tags, lines, waits, verdict, verdictOpacity, opacity };
}

type Sink = {
  byId: Map<string, { x: number; y: number }>;
  actors: Map<string, ActorState>;
  packets: PacketState[];
  tags: TagState[];
  lines: LineState[];
  waits: WaitState[];
  setVerdict: (v: { text: string; tone: Tone }) => void;
};

function applyEvent(event: SceneEvent, t: number, s: Sink) {
  switch (event.kind) {
    case "fly": {
      const p = event.dur <= 0 ? 1 : (t - event.at) / event.dur;
      if (p >= 1) {
        const actor = s.actors.get(event.to);
        const age = t - event.at - event.dur;
        // A soft receiving outline rises and settles, without moving the box.
        if (actor && age < 0.55) actor.arrival = Math.max(actor.arrival, Math.sin(Math.PI * clamp01(age / 0.55)) * 0.6);
        return;
      }
      const from = s.byId.get(event.from);
      const to = s.byId.get(event.to);
      if (!from || !to) return;
      const at = (q: number) => {
        const e = ease(clamp01(q));
        return { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
      };
      const here = at(p);
      // A short fading trail behind the message shows which way it is going.
      const trail = [0.05, 0.1, 0.15].filter((d) => p - d > 0).map((d) => at(p - d));
      s.packets.push({ id: `${event.at}-${event.from}-${event.to}`, from: event.from, to: event.to, x: here.x, y: here.y, label: event.label, tone: event.tone ?? "accent", opacity: fadeIn(t - event.at) * fadeIn(event.at + event.dur - t), trail, progress: clamp01(p) });
      return;
    }
    case "say": {
      const actor = s.actors.get(event.actor);
      if (actor) {
        actor.previousSub = actor.sub;
        actor.previousTone = actor.tone;
        actor.sub = event.text;
        actor.tone = event.tone;
        actor.subOpacity = fadeIn(t - event.at);
      }
      return;
    }
    case "mark": {
      const actor = s.actors.get(event.actor);
      if (actor) { actor.mark = event.tone; actor.markOpacity = fadeIn(t - event.at); }
      return;
    }
    case "tag":
      s.tags.push({ row: event.row, value: event.value, label: event.label, tone: event.tone ?? "accent", opacity: fadeIn(t - event.at) });
      return;
    case "retone": {
      const tag = s.tags.find((x) => x.label === event.label);
      if (tag) tag.tone = event.tone;
      return;
    }
    case "line":
      s.lines.push({ value: event.value, label: event.label, opacity: fadeIn(t - event.at) });
      return;
    case "wait": {
      const progress = event.dur <= 0 ? 1 : clamp01((t - event.at) / event.dur);
      const existing = s.waits.findIndex((w) => w.actor === event.actor);
      const counted = event.label.replace("{n}", ((event.total ?? 0) * progress).toFixed(1));
      const state = { actor: event.actor, progress, label: progress >= 1 ? event.doneLabel : counted, opacity: fadeIn(t - event.at) };
      if (existing >= 0) s.waits[existing] = state;
      else s.waits.push(state);
      return;
    }
    case "verdict":
      s.setVerdict({ text: event.text, tone: event.tone });
      return;
  }
}
