// A small Raft cluster of five servers, as a pure discrete-event model. Both
// Raft playables (12.5 elections, 12.6 logs) run on it, so a vote, a term and
// a log entry mean the same thing in both. Time is in model milliseconds.
//
// What is fixed, so the same button always gives the same picture:
//   - every message takes DELAY (10 ms), a leader beats every HEARTBEAT (50 ms);
//   - election timers come from short fixed lists, one value per election a
//     server starts (a reset keeps the current value; firing moves to the next);
//   - at one instant, messages are handled before timers, and a server that
//     gets two vote requests at once answers the preferred sender first.
// All of it is course numbers, chosen inside the 150 to 300 ms range of the
// Raft paper.

export const N = 5;
export const MAJORITY = 3;
export const DELAY = 10;
export const HEARTBEAT = 50;
export const NAMES = ["S1", "S2", "S3", "S4", "S5"] as const;
export const LETTERS = "abcdefghij";
export const MAX_LOG = 8;

/** Election timers per server, ms. Reading: the first value is used until the server starts an election. */
export type TimerLists = readonly (readonly number[])[];
export const DEFAULT_TIMERS: TimerLists = [[300], [240, 230, 250], [190, 280, 200], [270, 220, 260], [210, 300, 240]];
export const TIE_TIMERS: TimerLists = [[300], [220, 160, 230], [220, 290, 200], [260, 240, 250], [280, 260, 240]];
export const CUT_S4_TIMERS: readonly number[] = [270, 200, 250, 180];
/** At one instant, S4 answers S2 first and S5 answers S3 first. */
const PREFERRED_SENDER: Record<number, number> = { 3: 1, 4: 2 };

export type Role = "follower" | "candidate" | "leader";
export type Entry = { term: number; cmd: string };
export type MsgKind = "rv" | "rvr" | "ae" | "aer";

export type Msg = {
  id: number;
  kind: MsgKind;
  from: number;
  to: number;
  sentAt: number;
  arriveAt: number;
  term: number;
  lastIdx?: number;
  lastTerm?: number;
  granted?: boolean;
  prevIdx?: number;
  prevTerm?: number;
  entries?: Entry[];
  commit?: number;
  ok?: boolean;
  matchIdx?: number;
};

export type Server = {
  id: number;
  up: boolean;
  /** Servers in the same group can talk. */
  group: number;
  role: Role;
  term: number;
  votedFor: number | null;
  votes: number[];
  ix: number;
  timerAt: number | null;
  timerStart: number;
  timerLen: number;
  log: Entry[];
  commit: number;
  nextIndex: number[];
  matchIndex: number[];
  hbAt: number | null;
};

export type TraceLine = { t: number; text: string };

export type Cluster = {
  now: number;
  seq: number;
  servers: Server[];
  msgs: Msg[];
  lists: number[][];
  todo: { at: number }[];
  letters: number;
  leaderlessSince: number | null;
  lastGap: number | null;
  roundTerms: number[];
  lastRounds: number;
  /** The last leader to be told "you are out of date" by a higher term. */
  stepDown: { id: number; by: number; at: number } | null;
  matchSince: number | null;
  erased: string[];
  trace: TraceLine[];
};

const clone = (c: Cluster): Cluster => ({
  ...c,
  servers: c.servers.map((s) => ({ ...s, votes: [...s.votes], log: [...s.log], nextIndex: [...s.nextIndex], matchIndex: [...s.matchIndex] })),
  msgs: c.msgs.map((m) => ({ ...m })),
  lists: c.lists.map((l) => [...l]),
  todo: c.todo.map((t) => ({ ...t })),
  roundTerms: [...c.roundTerms],
  erased: [...c.erased],
  trace: [...c.trace],
  stepDown: c.stepDown ? { ...c.stepDown } : null,
});

function say(c: Cluster, text: string) {
  c.trace.push({ t: c.now, text });
  if (c.trace.length > 40) c.trace.shift();
}

function arm(c: Cluster, s: Server) {
  const list = c.lists[s.id];
  const len = list[s.ix % list.length];
  s.timerStart = c.now;
  s.timerLen = len;
  s.timerAt = c.now + len;
}

function disarm(s: Server) {
  s.timerAt = null;
}

function send(c: Cluster, from: number, to: number, m: Omit<Msg, "id" | "from" | "to" | "sentAt" | "arriveAt">) {
  const a = c.servers[from];
  const b = c.servers[to];
  if (!a.up || a.group !== b.group) return;
  c.seq += 1;
  c.msgs.push({ ...m, id: c.seq, from, to, sentAt: c.now, arriveAt: c.now + DELAY });
}

const lastTerm = (s: Server) => (s.log.length ? s.log[s.log.length - 1].term : 0);

/** The shared starting point. `entries` are the committed entries every log starts with. */
export function initCluster(entries: number): Cluster {
  const log: Entry[] = Array.from({ length: entries }, (_, i) => ({ term: 1, cmd: LETTERS[i] }));
  const servers: Server[] = NAMES.map((_, id) => ({
    id,
    up: true,
    group: 0,
    role: id === 0 ? "leader" : "follower",
    term: 1,
    votedFor: 0,
    votes: id === 0 ? [0] : [],
    ix: 0,
    timerAt: null,
    timerStart: 0,
    timerLen: 0,
    log: [...log],
    commit: entries,
    nextIndex: Array(N).fill(entries + 1),
    matchIndex: Array(N).fill(entries),
    hbAt: id === 0 ? 0 : null,
  }));
  const c: Cluster = {
    now: 0,
    seq: 0,
    servers,
    msgs: [],
    lists: DEFAULT_TIMERS.map((l) => [...l]),
    todo: [],
    letters: entries,
    leaderlessSince: null,
    lastGap: null,
    roundTerms: [],
    lastRounds: 0,
    stepDown: null,
    matchSince: null,
    erased: [],
    trace: [],
  };
  for (const s of servers) if (s.id !== 0) arm(c, s);
  bookkeeping(c);
  return c;
}

// ---- time ----

type Pick = { at: number; rank: number; key: number; run: () => void };

function nextEvent(c: Cluster): Pick | null {
  let best: Pick | null = null;
  const offer = (p: Pick) => {
    if (!best || p.at < best.at || (p.at === best.at && (p.rank < best.rank || (p.rank === best.rank && p.key < best.key)))) best = p;
  };
  c.todo.forEach((t, i) => offer({ at: t.at, rank: 0, key: i, run: () => { c.todo.splice(c.todo.indexOf(t), 1); scriptedWrite(c); } }));
  for (const m of c.msgs) {
    const preferred = m.kind === "rv" && PREFERRED_SENDER[m.to] === m.from;
    offer({ at: m.arriveAt, rank: 1, key: preferred ? m.id - 1e6 : m.id, run: () => deliver(c, m) });
  }
  for (const s of c.servers) {
    if (s.up && s.role !== "leader" && s.timerAt !== null) offer({ at: s.timerAt, rank: 2, key: s.id, run: () => startElection(c, s) });
    if (s.up && s.role === "leader" && s.hbAt !== null) offer({ at: s.hbAt, rank: 3, key: s.id, run: () => heartbeat(c, s) });
  }
  return best;
}

/** Run the model forward to `to` (inclusive). Returns a new cluster; the input is not changed. */
export function advance(c0: Cluster, to: number): Cluster {
  const c = clone(c0);
  let guard = 0;
  for (;;) {
    const ev = nextEvent(c);
    if (!ev || ev.at > to || guard++ > 4000) break;
    c.now = Math.max(c.now, ev.at);
    ev.run();
    bookkeeping(c);
  }
  c.now = Math.max(c.now, to);
  bookkeeping(c);
  return c;
}

/** Run forward in 10 ms steps until `done` or `cap` ms, then `extra` ms more so heartbeats can carry commits. */
export function settle(c0: Cluster, done: (c: Cluster) => boolean, cap: number, extra = 60): Cluster {
  let c = c0;
  const end = c0.now + cap;
  while (c.now < end && !done(c)) c = advance(c, c.now + 10);
  return advance(c, c.now + extra);
}

// ---- rules ----

function startElection(c: Cluster, s: Server) {
  s.term += 1;
  s.role = "candidate";
  s.votedFor = s.id;
  s.votes = [s.id];
  s.ix += 1;
  arm(c, s);
  if (c.leaderlessSince !== null && !c.roundTerms.includes(s.term)) c.roundTerms.push(s.term);
  say(c, `${NAMES[s.id]} asks for votes, term ${s.term}`);
  for (const o of c.servers) {
    if (o.id !== s.id) send(c, s.id, o.id, { kind: "rv", term: s.term, lastIdx: s.log.length, lastTerm: lastTerm(s) });
  }
}

function becomeFollower(c: Cluster, s: Server, term: number) {
  s.term = term;
  s.role = "follower";
  s.votedFor = null;
  s.votes = [];
  s.hbAt = null;
  arm(c, s);
}

function becomeLeader(c: Cluster, s: Server) {
  s.role = "leader";
  disarm(s);
  s.log.push({ term: s.term, cmd: "" });
  s.nextIndex = Array(N).fill(s.log.length + 1);
  s.matchIndex = Array(N).fill(0);
  s.matchIndex[s.id] = s.log.length;
  s.hbAt = c.now;
  say(c, `${NAMES[s.id]} leads term ${s.term} with ${s.votes.length} of ${N} votes`);
}

function replicate(c: Cluster, l: Server, to: number) {
  const prevIdx = l.nextIndex[to] - 1;
  send(c, l.id, to, {
    kind: "ae",
    term: l.term,
    prevIdx,
    prevTerm: prevIdx > 0 ? l.log[prevIdx - 1]?.term ?? 0 : 0,
    entries: l.log.slice(prevIdx),
    commit: l.commit,
  });
}

function heartbeat(c: Cluster, l: Server) {
  l.hbAt = c.now + HEARTBEAT;
  for (const o of c.servers) if (o.id !== l.id) replicate(c, l, o.id);
}

function leaderCommit(l: Server) {
  for (let n = l.log.length; n > l.commit; n--) {
    if (l.log[n - 1].term !== l.term) continue;
    if (l.matchIndex.filter((m) => m >= n).length >= MAJORITY) {
      l.commit = n;
      break;
    }
  }
}

function deliver(c: Cluster, m: Msg) {
  c.msgs.splice(c.msgs.indexOf(m), 1);
  const s = c.servers[m.to];
  if (!s.up || c.servers[m.from].group !== s.group) return;
  if (m.kind === "rv") onVoteRequest(c, s, m);
  else if (m.kind === "rvr") onVoteReply(c, s, m);
  else if (m.kind === "ae") onAppend(c, s, m);
  else onAppendReply(c, s, m);
}

function higherTerm(c: Cluster, s: Server, m: Msg) {
  if (s.role === "leader") {
    c.stepDown = { id: s.id, by: m.from, at: c.now };
    say(c, `${NAMES[s.id]} sees term ${m.term} and steps down`);
  }
  becomeFollower(c, s, m.term);
}

function onVoteRequest(c: Cluster, s: Server, m: Msg) {
  if (m.term > s.term) higherTerm(c, s, m);
  const upToDate = (m.lastTerm ?? 0) > lastTerm(s) || ((m.lastTerm ?? 0) === lastTerm(s) && (m.lastIdx ?? 0) >= s.log.length);
  const grant = m.term === s.term && (s.votedFor === null || s.votedFor === m.from) && upToDate;
  if (grant) {
    s.votedFor = m.from;
    arm(c, s);
    say(c, `${NAMES[s.id]} votes for ${NAMES[m.from]}`);
  } else if (m.term === s.term) {
    say(c, `${NAMES[s.id]} refuses ${NAMES[m.from]}${upToDate ? "" : ": its log is behind"}`);
  }
  send(c, s.id, m.from, { kind: "rvr", term: s.term, granted: grant });
}

function onVoteReply(c: Cluster, s: Server, m: Msg) {
  if (m.term > s.term) {
    higherTerm(c, s, m);
    return;
  }
  if (m.term !== s.term || !m.granted || (s.role !== "candidate" && s.role !== "leader")) return;
  if (!s.votes.includes(m.from)) s.votes.push(m.from);
  if (s.role === "candidate" && s.votes.length >= MAJORITY) becomeLeader(c, s);
}

function onAppend(c: Cluster, s: Server, m: Msg) {
  if (m.term < s.term) {
    send(c, s.id, m.from, { kind: "aer", term: s.term, ok: false, matchIdx: 0 });
    return;
  }
  if (m.term > s.term || s.role !== "follower") {
    if (m.term > s.term) higherTerm(c, s, m);
    else {
      s.role = "follower";
      s.votes = [];
    }
  }
  arm(c, s);
  const prevIdx = m.prevIdx ?? 0;
  const matches = prevIdx === 0 || (s.log[prevIdx - 1] !== undefined && s.log[prevIdx - 1].term === m.prevTerm);
  if (!matches) {
    send(c, s.id, m.from, { kind: "aer", term: s.term, ok: false, matchIdx: 0 });
    return;
  }
  const entries = m.entries ?? [];
  entries.forEach((e, k) => {
    const at = prevIdx + k; // zero-based slot
    if (s.log[at] !== undefined && s.log[at].term !== e.term) {
      for (const dropped of s.log.splice(at)) if (dropped.cmd && !c.erased.includes(dropped.cmd)) c.erased.push(dropped.cmd);
      say(c, `${NAMES[s.id]} drops its entries from slot ${at + 1}`);
    }
    if (s.log[at] === undefined) s.log.push({ ...e });
  });
  s.commit = Math.max(s.commit, Math.min(m.commit ?? 0, prevIdx + entries.length));
  send(c, s.id, m.from, { kind: "aer", term: s.term, ok: true, matchIdx: prevIdx + entries.length });
}

function onAppendReply(c: Cluster, s: Server, m: Msg) {
  if (m.term > s.term) {
    higherTerm(c, s, m);
    return;
  }
  if (s.role !== "leader" || m.term !== s.term) return;
  if (m.ok) {
    s.matchIndex[m.from] = Math.max(s.matchIndex[m.from], m.matchIdx ?? 0);
    s.nextIndex[m.from] = Math.max(s.nextIndex[m.from], s.matchIndex[m.from] + 1);
    leaderCommit(s);
  } else {
    s.nextIndex[m.from] = Math.max(1, s.nextIndex[m.from] - 1);
    replicate(c, s, m.from);
  }
}

function bookkeeping(c: Cluster) {
  const leaders = c.servers.filter((s) => s.up && s.role === "leader");
  if (leaders.length === 0 && c.leaderlessSince === null) {
    c.leaderlessSince = c.now;
    c.roundTerms = [];
  } else if (leaders.length > 0 && c.leaderlessSince !== null) {
    c.lastGap = c.now - c.leaderlessSince;
    c.lastRounds = c.roundTerms.length;
    c.leaderlessSince = null;
  }
  const up = c.servers.filter((s) => s.up);
  const same = up.every((s) => s.log.length === up[0].log.length && s.commit === up[0].commit && s.log.every((e, i) => e.term === up[0].log[i].term && e.cmd === up[0].log[i].cmd));
  if (same) {
    if (c.matchSince === null) c.matchSince = c.now;
  } else c.matchSince = null;
}

// ---- what the learner can do ----

/** The leader a client would reach: the live leader of the highest term. */
export function leaderNow(c: Cluster): Server | null {
  const ls = c.servers.filter((s) => s.up && s.role === "leader").sort((a, b) => b.term - a.term);
  return ls[0] ?? null;
}

export function liveLeaders(c: Cluster): Server[] {
  return c.servers.filter((s) => s.up && s.role === "leader");
}

export const upCount = (c: Cluster) => c.servers.filter((s) => s.up).length;

function restartTimers(c: Cluster, lists: TimerLists) {
  c.lists = lists.map((l) => [...l]);
  for (const s of c.servers) {
    s.ix = 0;
    if (s.up && s.role !== "leader") arm(c, s);
  }
}

function crashLeader(c0: Cluster, lists: TimerLists, line: string): Cluster {
  const c = clone(c0);
  const l = leaderNow(c);
  if (!l) return c0;
  l.up = false;
  l.hbAt = null;
  c.msgs = c.msgs.filter((m) => m.from !== l.id && m.to !== l.id);
  say(c, `${NAMES[l.id]} crashes`);
  say(c, line);
  restartTimers(c, lists);
  bookkeeping(c);
  return c;
}

export const killLeader = (c: Cluster) => crashLeader(c, DEFAULT_TIMERS, "Every follower starts waiting");
export const forceTie = (c: Cluster) => crashLeader(c, TIE_TIMERS, "S2 and S3 will fire at the same moment");

/** The follower that dies next: the highest-numbered live server that is not a leader. */
export function nextVictim(c: Cluster): Server | null {
  const v = c.servers.filter((s) => s.up && s.role !== "leader").sort((a, b) => b.id - a.id);
  return v[0] ?? null;
}

export function killNext(c0: Cluster): Cluster {
  const v = nextVictim(c0);
  if (!v) return c0;
  const c = clone(c0);
  c.servers[v.id].up = false;
  c.servers[v.id].timerAt = null;
  c.msgs = c.msgs.filter((m) => m.from !== v.id && m.to !== v.id);
  say(c, `${NAMES[v.id]} crashes`);
  bookkeeping(c);
  return c;
}

export function cutS4(c0: Cluster): Cluster {
  const c = clone(c0);
  const s = c.servers[3];
  if (!s.up || s.group !== 0) return c0;
  s.group = 1;
  c.lists[3] = [...CUT_S4_TIMERS];
  s.ix = 0;
  if (s.role !== "leader") arm(c, s);
  c.todo.push({ at: c.now + 20 });
  say(c, "S4 is cut off; a client write reaches the leader");
  bookkeeping(c);
  return c;
}

export function reconnect(c0: Cluster): Cluster {
  const c = clone(c0);
  if (c.servers.every((s) => s.group === 0)) return c0;
  for (const s of c.servers) s.group = 0;
  say(c, "The links are back");
  for (const s of c.servers) {
    if (s.up && s.role === "candidate") for (const o of c.servers) if (o.id !== s.id) send(c, s.id, o.id, { kind: "rv", term: s.term, lastIdx: s.log.length, lastTerm: lastTerm(s) });
  }
  bookkeeping(c);
  return c;
}

/** A client write that the model sends to the leader at once (used after the cut in the election playable). */
function scriptedWrite(c: Cluster) {
  const l = c.servers.filter((s) => s.up && s.role === "leader" && s.group === 0).sort((a, b) => b.term - a.term)[0];
  if (l) appendEntry(c, l);
}

function appendEntry(c: Cluster, l: Server) {
  const cmd = LETTERS[c.letters % LETTERS.length];
  c.letters += 1;
  l.log.push({ term: l.term, cmd });
  l.matchIndex[l.id] = l.log.length;
  say(c, `${NAMES[l.id]} appends ${cmd} at slot ${l.log.length}`);
  for (const o of c.servers) if (o.id !== l.id) replicate(c, l, o.id);
}

/** Log playable: send the next entry to the chosen leader. */
export function sendEntry(c0: Cluster, leaderId: number): Cluster {
  const l = c0.servers[leaderId];
  if (!l.up || l.role !== "leader" || l.log.length >= MAX_LOG) return c0;
  const c = clone(c0);
  appendEntry(c, c.servers[leaderId]);
  bookkeeping(c);
  return c;
}

/** Log playable: S1 and S2 lose the link to S3, S4 and S5. The other three start waiting. */
export function cutHalf(c0: Cluster): Cluster {
  const c = clone(c0);
  if (c.servers.some((s) => s.group !== 0)) return c0;
  c.servers[0].group = 1;
  c.servers[1].group = 1;
  c.lists = DEFAULT_TIMERS.map((l) => [...l]);
  for (const s of c.servers) {
    s.ix = 0;
    if (s.group === 0 && s.up && s.role !== "leader") arm(c, s);
  }
  say(c, "S1 and S2 are cut off from S3, S4 and S5");
  bookkeeping(c);
  return c;
}

export function heal(c0: Cluster): Cluster {
  const c = clone(c0);
  if (c.servers.every((s) => s.group === 0)) return c0;
  for (const s of c.servers) s.group = 0;
  say(c, "The links are back");
  bookkeeping(c);
  return c;
}

// ---- reading the state ----

/** Fraction of the election timer still left, 0 to 1. Leaders and dead servers have none. */
export function timerLeft(c: Cluster, s: Server): number {
  if (!s.up || s.role === "leader" || s.timerAt === null || s.timerLen <= 0) return 0;
  return Math.max(0, Math.min(1, (s.timerAt - c.now) / s.timerLen));
}

export function holders(c: Cluster, slot: number, cmd: string, term: number): number {
  return c.servers.filter((s) => s.up && s.log[slot - 1]?.cmd === cmd && s.log[slot - 1]?.term === term).length;
}

export function stateLines(c: Cluster): string[] {
  return c.servers.map((s) => {
    if (!s.up) return `${NAMES[s.id]} down`;
    const cut = s.group !== 0 ? ", cut off" : "";
    return `${NAMES[s.id]} ${s.role} term ${s.term}${s.role === "candidate" ? `, ${s.votes.length} votes` : ""}${cut}`;
  });
}

export function logText(c: Cluster, id: number): string {
  const s = c.servers[id];
  if (!s.up) return `${NAMES[id]} is down`;
  const items = s.log.map((e, i) => `${e.cmd || "empty"}(term ${e.term}${i + 1 > s.commit ? ", not committed" : ""})`);
  return `${NAMES[id]}: ${items.length ? items.join(" ") : "empty"}; committed up to ${s.commit}`;
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export type ElectionContext = "start" | "kill" | "tie" | "cut" | "reconnect" | "other";

/** The one-line result for the election playable. All lines are 38 characters or fewer. */
export function electionVerdict(c: Cluster, ctx: ElectionContext): Verdict {
  const leaders = liveLeaders(c);
  const leader = leaderNow(c);
  const up = upCount(c);
  const s4 = c.servers[3];
  if (ctx === "reconnect" && c.stepDown && c.stepDown.by === 3) return { text: "S4's old term forced a new election", tone: "warn" };
  if (leaders.length === 0 && up < MAJORITY) return { text: "No majority: no leader is possible", tone: "bad" };
  if (leaders.length > 0 && up < MAJORITY) return { text: `Only ${up} of 5 up: no majority`, tone: "bad" };
  if (ctx === "cut" && s4.group !== 0) {
    if (s4.role === "candidate") return { text: `S4 alone: term ${s4.term}, no majority`, tone: "warn" };
    return { text: "S4 is cut off: the rest carry on", tone: "accent" };
  }
  if (leaders.length === 0) {
    const open = c.servers.filter((s) => s.up && s.role === "candidate");
    const split = open.length >= 2 && open.some((s) => s.term === open[0].term && s.id !== open[0].id);
    if (split) return { text: "Tie: nobody has 3 votes, retry", tone: "warn" };
    if (open.length === 1) return { text: `${NAMES[open[0].id]} asks for votes, term ${open[0].term}`, tone: "accent" };
    return { text: "No leader: every timer is running", tone: "warn" };
  }
  if (ctx === "kill" || ctx === "tie" || ctx === "other") {
    if (leader && leader.id !== 0 && c.lastGap !== null) {
      if (c.lastRounds > 1) return { text: `Tie: ${NAMES[leader.id]} won term ${leader.term} after a retry`, tone: "good" };
      return { text: `${NAMES[leader.id]} won term ${leader.term} with ${leader.votes.length} of 5 votes`, tone: "good" };
    }
  }
  if (ctx === "reconnect" && leader && c.lastGap !== null) return { text: "S4's old term forced a new election", tone: "warn" };
  if (leader) return { text: `${NAMES[leader.id]} leads term ${leader.term}: all quiet`, tone: "good" };
  return { text: "Running", tone: "accent" };
}

export type LogContext = "start" | "send" | "cut" | "heal" | "kill";

/** The one-line result for the log playable. All lines are 38 characters or fewer. */
export function logVerdict(c: Cluster, ctx: LogContext): Verdict {
  const leaders = liveLeaders(c);
  if (leaders.length >= 2) return { text: "Two leaders, only one can commit", tone: "warn" };
  if (ctx === "heal" || ctx === "send") {
    if (c.erased.length && ctx === "heal") {
      const settled = c.matchSince !== null && c.now - c.matchSince >= 800;
      if (!settled) return { text: `${c.erased[0]} was never committed: erased`, tone: "warn" };
    }
    if (ctx === "heal" && c.matchSince !== null && c.now - c.matchSince >= 800) {
      return { text: upCount(c) === N ? "All five logs match again" : "All live logs match again", tone: "good" };
    }
  }
  const l = leaderNow(c);
  const last = c.letters > 0 ? LETTERS[(c.letters - 1) % LETTERS.length] : "";
  if (l && ctx !== "start" && last) {
    let slot = 0;
    l.log.forEach((e, i) => { if (e.cmd === last) slot = i + 1; });
    if (slot > 0) {
      const have = holders(c, slot, last, l.log[slot - 1].term);
      if (l.commit >= slot) return { text: "Majority holds it: committed", tone: "good" };
      if (upCount(c) < MAJORITY) return { text: `${upCount(c)} of 5: no majority`, tone: "bad" };
      return { text: `${have} of 5: stored, not committed`, tone: "warn" };
    }
  }
  if (upCount(c) < MAJORITY) return { text: `${upCount(c)} of 5: no majority`, tone: "bad" };
  return { text: ctx === "start" ? "S1 leads: send an entry" : "Logs follow the leader", tone: "accent" };
}
