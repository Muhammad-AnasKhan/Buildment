// 18.4 beat 5: a Deployment of pods behind a Service, with an autoscaler.
// Pods are replaceable; readiness decides who gets traffic; CPU decides how many
// pods run. Time is in "play seconds": a pod warms up for 3 s, the autoscaler
// looks every 3 s (stands for 15 s) and scales down only after 8 s of lower
// readings (stands for 300 s). Every pod serves 100 requests a second at 100% CPU.

export const CAPACITY_PER_POD = 100;
export const WARM_S = 3;
export const KILL_FLASH_S = 0.5;
export const HPA_EVERY_S = 3;
export const DOWN_WINDOW_S = 8;
export const TARGET_CPU = 60;
export const TOLERANCE = 0.1;
export const MIN_PODS = 2;
export const MAX_PODS = 8;
export const LOAD_MAX = 600;
export const LOAD_STEP = 20;
export const DEFAULT_LOAD = 180;
export const START_PODS = 3;
export const LOAD_LADDER: readonly number[] = Array.from({ length: LOAD_MAX / LOAD_STEP + 1 }, (_, i) => i * LOAD_STEP);

const EPS = 1e-9;
const SUBSTEP_S = 0.1;

export type PodState = "starting" | "running" | "killed";
export type PodOrigin = "start" | "replace" | "scale";
export type Pod = {
  id: number;
  state: PodState;
  /** Seconds left: warming up (starting) or flashing red before the replacement appears (killed). */
  left: number;
  /** The readiness check fails: the pod keeps running but gets no traffic. */
  probeFail: boolean;
  origin: PodOrigin;
};

export type Sim = {
  pods: Pod[];
  nextId: number;
  /** The Deployment's wanted number of pods. */
  replicas: number;
  auto: boolean;
  load: number;
  sinceCheck: number;
  /** Seconds the autoscaler has wanted fewer pods than there are. */
  lowFor: number;
  /** The most pods it wanted during that time. */
  lowMax: number;
};

const running = (id: number, origin: PodOrigin = "start"): Pod => ({ id, state: "running", left: 0, probeFail: false, origin });
const starting = (id: number, origin: PodOrigin): Pod => ({ id, state: "starting", left: WARM_S, probeFail: false, origin });

export function initSim(auto = false, load = DEFAULT_LOAD): Sim {
  return {
    pods: Array.from({ length: START_PODS }, (_, i) => running(i + 1)),
    nextId: START_PODS + 1,
    replicas: START_PODS,
    auto,
    load,
    sinceCheck: 0,
    lowFor: 0,
    lowMax: 0,
  };
}

export const isServing = (p: Pod) => p.state === "running" && !p.probeFail;
export const servingCount = (s: Sim) => s.pods.filter(isServing).length;
export const capacityOf = (s: Sim) => CAPACITY_PER_POD * servingCount(s);

/** Requests a second each serving pod gets: the Service shares the load equally. */
export const perPodLoad = (s: Sim) => (servingCount(s) > 0 ? s.load / servingCount(s) : 0);

/** CPU of each serving pod in percent: min(100, 100 x load / (capacity x serving pods)). */
export function cpuOf(s: Sim): number {
  const n = servingCount(s);
  if (n === 0) return s.load > 0 ? 100 : 0;
  return Math.min(100, (100 * s.load) / (CAPACITY_PER_POD * n));
}

/** Requests a second above what the serving pods can handle: they are dropped. */
export const droppedOf = (s: Sim) => Math.max(0, s.load - capacityOf(s));

/**
 * What the autoscaler wants now: ceil(serving pods x CPU / 60), kept within 2 to 8,
 * and no change when the reading is within 10% of the target.
 */
export function desiredNow(s: Sim): number {
  const n = servingCount(s);
  if (n === 0) return s.replicas;
  const ratio = cpuOf(s) / TARGET_CPU;
  if (Math.abs(ratio - 1) <= TOLERANCE + EPS) return s.replicas;
  return Math.max(MIN_PODS, Math.min(MAX_PODS, Math.ceil((n * cpuOf(s)) / TARGET_CPU - EPS)));
}

/** Add pods up to the wanted number, or remove extra ones (not-ready pods first). */
function reconcile(s: Sim): Sim {
  let pods = s.pods.slice();
  let nextId = s.nextId;
  while (pods.length < s.replicas) pods.push(starting(nextId++, "scale"));
  while (pods.length > s.replicas) {
    let at = -1;
    for (let i = pods.length - 1; i >= 0 && at === -1; i--) if (pods[i].state === "starting") at = i;
    for (let i = pods.length - 1; i >= 0 && at === -1; i--) if (pods[i].state === "running" && pods[i].probeFail) at = i;
    if (at === -1) at = pods.length - 1;
    pods = pods.filter((_, i) => i !== at);
  }
  return { ...s, pods, nextId };
}

function autoscalerCheck(s: Sim): Sim {
  if (servingCount(s) === 0) return s;
  const want = desiredNow(s);
  if (want > s.replicas) return reconcile({ ...s, replicas: want, lowFor: 0, lowMax: 0 });
  if (want < s.replicas) {
    const lowFor = s.lowFor + HPA_EVERY_S;
    const lowMax = Math.max(s.lowMax, want);
    if (lowFor >= DOWN_WINDOW_S - EPS) return reconcile({ ...s, replicas: lowMax, lowFor: 0, lowMax: 0 });
    return { ...s, lowFor, lowMax };
  }
  return { ...s, lowFor: 0, lowMax: 0 };
}

function tick(s: Sim, h: number): Sim {
  let nextId = s.nextId;
  const pods = s.pods.map((p): Pod => {
    if (p.state === "starting") {
      const left = p.left - h;
      return left <= EPS ? { ...p, state: "running", left: 0 } : { ...p, left };
    }
    if (p.state === "killed") {
      const left = p.left - h;
      // The killed pod is gone: its replacement starts in the same place.
      return left <= EPS ? starting(nextId++, "replace") : { ...p, left };
    }
    return p;
  });
  let next: Sim = { ...s, pods, nextId };
  if (!next.auto) return { ...next, sinceCheck: 0, lowFor: 0, lowMax: 0 };
  const sinceCheck = next.sinceCheck + h;
  if (sinceCheck >= HPA_EVERY_S - EPS) next = autoscalerCheck({ ...next, sinceCheck: 0 });
  else next = { ...next, sinceCheck };
  return next;
}

/** Move the cluster forward by `dt` play seconds. */
export function advance(s: Sim, dt: number): Sim {
  if (!(dt > 0)) return s;
  const steps = Math.ceil(dt / SUBSTEP_S - EPS);
  const h = dt / steps;
  let cur = s;
  for (let i = 0; i < steps; i++) cur = tick(cur, h);
  return cur;
}

/** Nothing is starting or flashing, and the autoscaler is content. */
export function isStable(s: Sim): boolean {
  if (s.pods.some((p) => p.state !== "running")) return false;
  return !s.auto || (desiredNow(s) === s.replicas && s.lowFor === 0);
}

/** For reduced motion: run on until the cluster has settled (at most `cap` seconds). */
export function settle(s: Sim, cap = 60): Sim {
  let cur = s;
  for (let t = 0; t < cap && !isStable(cur); t += 0.5) cur = advance(cur, 0.5);
  return cur;
}

export function killPod(s: Sim, id: number): Sim {
  return { ...s, pods: s.pods.map((p) => (p.id === id && p.state !== "killed" ? { ...p, state: "killed", left: KILL_FLASH_S } : p)) };
}

export function toggleProbe(s: Sim, id: number): Sim {
  return { ...s, pods: s.pods.map((p) => (p.id === id && p.state !== "killed" ? { ...p, probeFail: !p.probeFail } : p)) };
}

export const setLoad = (s: Sim, load: number): Sim => ({ ...s, load });
export const setAuto = (s: Sim, auto: boolean): Sim => ({ ...s, auto, sinceCheck: 0, lowFor: 0, lowMax: 0 });

const clamp01 = (f: number) => Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0));
export const loadFromFraction = (f: number) => Math.round((clamp01(f) * LOAD_MAX) / LOAD_STEP) * LOAD_STEP;
export const loadFraction = (load: number) => clamp01(load / LOAD_MAX);

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(s: Sim): Verdict {
  if (droppedOf(s) > 0) return { text: "Over capacity: requests dropped", tone: "bad" };
  if (s.pods.some((p) => p.state === "starting" && p.origin === "scale")) return { text: "Scaling: new pods are not ready yet", tone: "warn" };
  if (s.pods.some((p) => p.state === "running" && p.probeFail)) return { text: "Alive but not ready: no traffic", tone: "warn" };
  if (s.pods.some((p) => p.state !== "running")) return { text: "One pod short: the rest take its load", tone: "warn" };
  const pct = Math.round(cpuOf(s));
  if (s.load === 0) return { text: "No traffic: the pods are idle", tone: "good" };
  if (pct > 70) return { text: `${pct}% busy: near the knee`, tone: "warn" };
  if (pct >= 50) return { text: `On target: ${pct}% busy`, tone: "good" };
  return { text: `${pct}% busy: room to spare`, tone: "good" };
}
