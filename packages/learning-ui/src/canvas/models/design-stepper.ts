import type { Tone } from "../primitives/tones";
import type { ActorKind } from "../renderers/scene/types";

// A design that grows one step at a time. Each step is a patch on the
// picture: it adds parts, links and small chips, changes status pills, and
// sets the requests that run through it. Patches carry forward, so a later
// step keeps what an earlier step added. A step can also hold an action the
// learner plays with (flip a choice, break a part, add the fix): its phases
// are patches on top of that step, and they do not carry to later steps.
// Pure: designFrame(spec, step, phase) always gives the same picture.

export type DesignActor = { id: string; label: string; kind: ActorKind; x: number; y: number };
/** A small chip in the picture: a requirement, the driving number, a detail on a part. x and y are its centre. */
export type DesignTag = { id: string; text: string; x: number; y: number; tone?: Tone };
export type DesignLink = { id: string; from: string; to: string };
/** A request that runs along a path of actors, over and over. offset (0 to 1) staggers two flows. */
export type DesignFlow = { path: string[]; label?: string; tone?: Tone; offset?: number };
export type DesignVerdict = { text: string; tone: Tone };
export type DesignStatus = { text: string; tone?: Tone };

export type DesignPatch = {
  actors?: DesignActor[];
  links?: DesignLink[];
  tags?: DesignTag[];
  /** Ids of actors, links or tags to take away. Links to a removed actor go too. */
  remove?: string[];
  /** Status pill per actor; null clears it. */
  status?: Record<string, DesignStatus | null>;
  /** Actors drawn faint and dashed: considered, not part of the design. */
  ghost?: string[];
  unghost?: string[];
  /** Actors or links that have failed. A link to a failed actor fails too. */
  broken?: string[];
  fixed?: string[];
  /** Replaces the requests running through the picture. */
  flows?: DesignFlow[];
  /** A ring around the parts that matter in this step. Not carried forward. */
  mark?: Record<string, Tone>;
};

/**
 * One state of a step's action. `button` names the move to the next state;
 * `target` is the actor the learner can tap in the picture to make the same move.
 */
export type DesignPhase = { button: string; target?: string; patch?: DesignPatch; verdict?: DesignVerdict; says?: string };

export type DesignAction = {
  /** A two-state choice (on and off), announced as a pressed button. */
  toggle?: boolean;
  /** Phase 0 is the step as it is; the button moves to the next phase and wraps round. */
  phases: DesignPhase[];
};

export type DesignStep = {
  id: string;
  /** The chip label: one or two words. */
  title: string;
  patch: DesignPatch;
  /** At most 38 characters. */
  verdict: DesignVerdict;
  /** What changed in this step, in one short sentence. */
  says: string;
  /** What to tap, in one short line. */
  hint: string;
  action?: DesignAction;
};

export type DesignSpec = {
  width: number;
  height: number;
  steps: DesignStep[];
  /** A faint dashed area with a line of text, shown until the first link is drawn: where the design will grow. */
  empty?: { text: string; x: number; y: number; width: number; height: number };
};

export type FrameActor = DesignActor & { status?: DesignStatus; ghost: boolean; broken: boolean; mark?: Tone; isNew: boolean };
export type FrameLink = DesignLink & { a: { x: number; y: number }; b: { x: number; y: number }; ghost: boolean; broken: boolean; lit: boolean; isNew: boolean };
export type FrameTag = DesignTag & { width: number; isNew: boolean };
export type FrameFlow = { ids: string[]; points: { x: number; y: number }[]; label?: string; tone: Tone; offset: number; cut: boolean };

export type DesignFrame = {
  step: number;
  phase: number;
  title: string;
  actors: FrameActor[];
  links: FrameLink[];
  tags: FrameTag[];
  flows: FrameFlow[];
  verdict: DesignVerdict;
  says: string;
  hint: string;
  action?: { label: string; target?: string; toggle: boolean; pressed: boolean; phases: number };
};

export const VERDICT_MAX = 38;
export const STATUS_MAX = 15;
export const CARD_W = 112;
export const CARD_H = 60;
export const TAG_H = 20;
/** Seconds a request takes to cross one link, and the rest before it runs again. */
export const HOP_SECONDS = 0.8;
export const FLOW_REST_SECONDS = 0.7;

/** Chip width from its text, at 11.5 px semibold. */
export const tagWidth = (text: string) => Math.round(text.length * 6.6 + 18);

type State = {
  actors: Map<string, DesignActor>;
  links: Map<string, DesignLink>;
  tags: Map<string, DesignTag>;
  status: Map<string, DesignStatus>;
  ghost: Set<string>;
  broken: Set<string>;
  flows: DesignFlow[];
};

const empty = (): State => ({ actors: new Map(), links: new Map(), tags: new Map(), status: new Map(), ghost: new Set(), broken: new Set(), flows: [] });

function apply(prev: State, patch: DesignPatch | undefined, problems: string[], where: string): State {
  if (!patch) return prev;
  const s: State = {
    actors: new Map(prev.actors),
    links: new Map(prev.links),
    tags: new Map(prev.tags),
    status: new Map(prev.status),
    ghost: new Set(prev.ghost),
    broken: new Set(prev.broken),
    flows: prev.flows,
  };
  for (const a of patch.actors ?? []) s.actors.set(a.id, a);
  for (const t of patch.tags ?? []) s.tags.set(t.id, t);
  for (const l of patch.links ?? []) {
    if (!s.actors.has(l.from) || !s.actors.has(l.to)) problems.push(`${where}: link ${l.id} joins an unknown actor`);
    s.links.set(l.id, l);
  }
  for (const id of patch.remove ?? []) {
    if (!s.actors.delete(id) && !s.links.delete(id) && !s.tags.delete(id)) problems.push(`${where}: cannot remove unknown ${id}`);
    s.status.delete(id);
    s.ghost.delete(id);
    s.broken.delete(id);
  }
  for (const [id, l] of s.links) if (!s.actors.has(l.from) || !s.actors.has(l.to)) s.links.delete(id);
  const known = (id: string, what: string) => {
    if (s.actors.has(id) || s.links.has(id)) return true;
    problems.push(`${where}: ${what} names unknown ${id}`);
    return false;
  };
  for (const [id, st] of Object.entries(patch.status ?? {})) {
    if (!known(id, "status")) continue;
    if (st) s.status.set(id, st);
    else s.status.delete(id);
  }
  for (const id of patch.ghost ?? []) if (known(id, "ghost")) s.ghost.add(id);
  for (const id of patch.unghost ?? []) if (known(id, "unghost")) s.ghost.delete(id);
  for (const id of patch.broken ?? []) if (known(id, "broken")) s.broken.add(id);
  for (const id of patch.fixed ?? []) if (known(id, "fixed")) s.broken.delete(id);
  if (patch.flows) {
    for (const f of patch.flows) for (const id of f.path) if (!s.actors.has(id)) problems.push(`${where}: flow names unknown ${id}`);
    s.flows = patch.flows;
  }
  for (const id of Object.keys(patch.mark ?? {})) known(id, "mark");
  return s;
}

const clampIndex = (i: number, n: number) => (n <= 0 ? 0 : Math.max(0, Math.min(n - 1, Math.trunc(Number.isFinite(i) ? i : 0))));

/** Ids a patch brings into view: new parts, links and chips, and parts that stop being faint. */
function addedBy(patch: DesignPatch | undefined): Set<string> {
  const out = new Set<string>();
  if (!patch) return out;
  for (const x of [...(patch.actors ?? []), ...(patch.links ?? []), ...(patch.tags ?? [])]) out.add(x.id);
  for (const id of patch.unghost ?? []) out.add(id);
  return out;
}

function resolve(spec: DesignSpec, stepIn: number, phaseIn: number, problems: string[]) {
  const step = clampIndex(stepIn, spec.steps.length);
  let state = empty();
  for (let i = 0; i <= step; i++) state = apply(state, spec.steps[i]?.patch, problems, `step ${i + 1}`);
  const current = spec.steps[step];
  const phases = current?.action?.phases ?? [];
  const phase = phases.length > 0 ? clampIndex(phaseIn, phases.length) : 0;
  for (let j = 0; j <= phase && j < phases.length; j++) state = apply(state, phases[j].patch, problems, `step ${step + 1} phase ${j}`);
  return { step, phase, state, current, phases };
}

/** The picture at one step of the design, with its action in one phase. */
export function designFrame(spec: DesignSpec, stepIn: number, phaseIn = 0): DesignFrame {
  const { step, phase, state, current, phases } = resolve(spec, stepIn, phaseIn, []);
  const latest = phase > 0 ? phases[phase]?.patch : current?.patch;
  const fresh = addedBy(phase > 0 ? latest : current?.patch);
  if (phase === 0) for (const id of addedBy(phases[0]?.patch)) fresh.add(id);
  // Marks belong to the latest patch that sets them.
  const mark = (phase > 0 && phases[phase]?.patch?.mark) || phases[0]?.patch?.mark || current?.patch.mark || {};

  const actors: FrameActor[] = [...state.actors.values()].map((a) => {
    const broken = state.broken.has(a.id);
    return {
      ...a,
      status: state.status.get(a.id),
      ghost: state.ghost.has(a.id),
      broken,
      mark: broken ? "bad" : mark[a.id],
      isNew: fresh.has(a.id),
    };
  });
  const byId = new Map(actors.map((a) => [a.id, a]));

  const flows: FrameFlow[] = [];
  for (const f of state.flows) {
    const ids: string[] = [];
    let cut = false;
    for (const id of f.path) {
      const a = byId.get(id);
      if (!a || a.ghost) break;
      ids.push(id);
      // A request that reaches a failed part stops there.
      if (a.broken) {
        cut = true;
        break;
      }
    }
    if (ids.length < 2) continue;
    flows.push({ ids, points: ids.map((id) => ({ x: byId.get(id)!.x, y: byId.get(id)!.y })), label: f.label, tone: cut ? "bad" : (f.tone ?? "accent"), offset: f.offset ?? 0, cut });
  }
  const litPairs = new Set(flows.flatMap((f) => f.ids.slice(1).map((id, i) => pairKey(f.ids[i], id))));

  const links: FrameLink[] = [];
  for (const l of state.links.values()) {
    const a = byId.get(l.from);
    const b = byId.get(l.to);
    if (!a || !b) continue;
    links.push({
      ...l,
      a: { x: a.x, y: a.y },
      b: { x: b.x, y: b.y },
      ghost: a.ghost || b.ghost,
      broken: state.broken.has(l.id) || a.broken || b.broken,
      lit: litPairs.has(pairKey(l.from, l.to)),
      isNew: fresh.has(l.id) || fresh.has(l.from) || fresh.has(l.to),
    });
  }

  const tags: FrameTag[] = [...state.tags.values()].map((t) => ({ ...t, width: tagWidth(t.text), isNew: fresh.has(t.id) }));

  const phaseData = phases[phase];
  const verdict = (phase > 0 ? phaseData?.verdict : undefined) ?? phases[0]?.verdict ?? current?.verdict ?? { text: "", tone: "accent" };
  const says = (phase > 0 ? phaseData?.says : undefined) ?? phases[0]?.says ?? current?.says ?? "";
  const action = current?.action && phases.length > 0
    ? { label: phaseData.button, target: phaseData.target, toggle: !!current.action.toggle, pressed: phase > 0, phases: phases.length }
    : undefined;

  return { step, phase, title: current?.title ?? "", actors, links, tags, flows, verdict, says, hint: current?.hint ?? "", action };
}

/** The phase the action button (or a tap on the target) moves to. Wraps round to the start. */
export function nextPhase(spec: DesignSpec, step: number, phase: number): number {
  const n = spec.steps[clampIndex(step, spec.steps.length)]?.action?.phases.length ?? 0;
  if (n <= 1) return 0;
  return (clampIndex(phase, n) + 1) % n;
}

const pairKey = (a: string, b: string) => [a, b].sort().join("~");

/** Where a flow's request is at a moment, or null while it rests between runs. */
export function flowPacket(flow: FrameFlow, seconds: number): { x: number; y: number; hop: number; progress: number } | null {
  const hops = flow.points.length - 1;
  if (hops < 1 || !Number.isFinite(seconds)) return null;
  const period = hops * HOP_SECONDS + FLOW_REST_SECONDS;
  const cycle = (((seconds / period + flow.offset) % 1) + 1) % 1;
  const t = cycle * period;
  if (t >= hops * HOP_SECONDS) return null;
  const hop = Math.min(hops - 1, Math.floor(t / HOP_SECONDS));
  const progress = t / HOP_SECONDS - hop;
  const a = flow.points[hop];
  const b = flow.points[hop + 1];
  return { x: a.x + (b.x - a.x) * progress, y: a.y + (b.y - a.y) * progress, hop, progress };
}

/** The hop of a flow that shows its label: the longest, so the chip clears the cards. */
export function labelHop(flow: FrameFlow): number {
  let best = 0;
  let bestLen = -1;
  for (let i = 0; i < flow.points.length - 1; i++) {
    const len = Math.hypot(flow.points[i + 1].x - flow.points[i].x, flow.points[i + 1].y - flow.points[i].y);
    if (len > bestLen) {
      bestLen = len;
      best = i;
    }
  }
  return best;
}

/** The picture in words, for screen readers. */
export function describeDesignFrame(frame: DesignFrame, total: number): string {
  const parts = [`Step ${frame.step + 1} of ${total}: ${frame.title}`];
  for (const t of frame.tags) parts.push(t.text);
  for (const a of frame.actors) {
    const state = a.ghost ? " (not added)" : a.broken ? " (failed)" : "";
    parts.push(`${a.label}${state}${a.status ? `: ${a.status.text}` : ""}`);
  }
  for (const f of frame.flows) parts.push(`${f.label ?? "a request"} runs ${f.ids.join(" to ")}${f.cut ? " and fails" : ""}`);
  parts.push(frame.verdict.text);
  return parts.join(". ") + ".";
}

type Box = { id: string; left: number; right: number; top: number; bottom: number };
const overlaps = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * Everything wrong with a design's data, at every step and phase: unknown
 * ids, verdicts or status pills too long to read, parts outside the picture
 * or on top of each other. An empty list means the design draws cleanly.
 */
export function checkDesign(spec: DesignSpec): string[] {
  const problems: string[] = [];
  if (spec.steps.length === 0) problems.push("no steps");
  spec.steps.forEach((step, i) => {
    const phaseCount = Math.max(1, step.action?.phases.length ?? 0);
    if (step.action && step.action.phases.length < 2) problems.push(`step ${i + 1}: an action needs at least 2 phases`);
    for (let p = 0; p < phaseCount; p++) {
      const where = `step ${i + 1} phase ${p}`;
      resolve(spec, i, p, problems);
      const f = designFrame(spec, i, p);
      if (f.verdict.text.length === 0 || f.verdict.text.length > VERDICT_MAX) problems.push(`${where}: verdict "${f.verdict.text}" is not 1 to ${VERDICT_MAX} characters`);
      if (f.action?.target && !f.actors.some((a) => a.id === f.action?.target)) problems.push(`${where}: tap target ${f.action.target} is not drawn`);
      for (const a of f.actors) if (a.status && a.status.text.length > STATUS_MAX) problems.push(`${where}: status "${a.status.text}" is over ${STATUS_MAX} characters`);
      const boxes: Box[] = [
        ...f.actors.map((a) => ({ id: a.id, left: a.x - CARD_W / 2, right: a.x + CARD_W / 2, top: a.y - CARD_H / 2, bottom: a.y + CARD_H / 2 })),
        ...f.tags.map((t) => ({ id: t.id, left: t.x - t.width / 2, right: t.x + t.width / 2, top: t.y - TAG_H / 2, bottom: t.y + TAG_H / 2 })),
      ];
      // The verdict banner owns the top 40 units.
      for (const b of boxes) if (b.left < 0 || b.right > spec.width || b.top < 42 || b.bottom > spec.height) problems.push(`${where}: ${b.id} is outside the picture`);
      for (let x = 0; x < boxes.length; x++) for (let y = x + 1; y < boxes.length; y++) if (overlaps(boxes[x], boxes[y])) problems.push(`${where}: ${boxes[x].id} overlaps ${boxes[y].id}`);
    }
  });
  return [...new Set(problems)];
}
