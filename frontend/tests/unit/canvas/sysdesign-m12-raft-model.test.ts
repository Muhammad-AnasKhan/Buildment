import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { sysdesignM12RaftElectionPlay } from "@/canvas/sysdesign-m12-raft-election-play/data";
import { sysdesignM12RaftLogPlay } from "@/canvas/sysdesign-m12-raft-log-play/data";
import {
  advance,
  cutHalf,
  cutS4,
  electionVerdict,
  forceTie,
  heal,
  initCluster,
  killLeader,
  killNext,
  leaderNow,
  liveLeaders,
  logText,
  logVerdict,
  reconnect,
  sendEntry,
  settle,
  stateLines,
  timerLeft,
  upCount,
  type Cluster,
} from "@/canvas/models/raft-cluster";

const term = (c: Cluster, id: number) => c.servers[id].term;

describe("raft cluster: elections", () => {
  it("starts quiet: S1 leads term 1 and the followers stay followers", () => {
    const c = advance(initCluster(3), 2000);
    expect(leaderNow(c)?.id).toBe(0);
    expect(c.servers.map((s) => s.term)).toEqual([1, 1, 1, 1, 1]);
    expect(c.servers.every((s) => s.log.length === 3 && s.commit === 3)).toBe(true);
  });

  it("kill the leader: S3 fires at 190 ms and leads at 210 ms with 4 of 5 votes", () => {
    const c0 = killLeader(advance(initCluster(3), 120));
    const at = c0.now;
    const before = advance(c0, at + 189);
    expect(liveLeaders(before)).toHaveLength(0);
    expect(term(before, 2)).toBe(1);
    const fired = advance(c0, at + 190);
    expect(fired.servers[2].role).toBe("candidate");
    expect(term(fired, 2)).toBe(2);
    expect(liveLeaders(advance(c0, at + 209))).toHaveLength(0);
    const won = advance(c0, at + 210);
    expect(leaderNow(won)?.id).toBe(2);
    expect(won.servers[2].votes.sort()).toEqual([1, 2, 3, 4]);
    expect(won.lastGap).toBe(210);
    expect(electionVerdict(won, "kill").text).toBe("S3 won term 2 with 4 of 5 votes");
    // S5 voted at 200 ms, so its own 210 ms timer never fires.
    expect(term(advance(c0, at + 400), 4)).toBe(2);
    expect(leaderNow(advance(c0, at + 3000))?.id).toBe(2);
  });

  it("force a tie: S2 and S3 fire together, split 2 and 2, and S2 wins term 3 at 400 ms", () => {
    const c0 = forceTie(advance(initCluster(3), 90));
    const at = c0.now;
    const split = advance(c0, at + 250);
    expect(liveLeaders(split)).toHaveLength(0);
    expect(split.servers[1].votes.sort()).toEqual([1, 3]);
    expect(split.servers[2].votes.sort()).toEqual([2, 4]);
    expect(term(split, 1)).toBe(2);
    expect(term(split, 2)).toBe(2);
    expect(electionVerdict(split, "tie").text).toBe("Tie: nobody has 3 votes, retry");
    expect(term(advance(c0, at + 379), 1)).toBe(2);
    expect(term(advance(c0, at + 380), 1)).toBe(3);
    const won = advance(c0, at + 400);
    expect(leaderNow(won)?.id).toBe(1);
    expect(won.lastGap).toBe(400);
    expect(electionVerdict(won, "tie").text).toBe("Tie: S2 won term 3 after a retry");
  });

  it("cut off S4: its term climbs 2, 3, 4, 5 at 270, 470, 720 and 900 ms while the rest stay in term 1", () => {
    const c0 = cutS4(advance(initCluster(3), 130));
    const at = c0.now;
    const terms = [269, 270, 470, 720, 900].map((t) => term(advance(c0, at + t), 3));
    expect(terms).toEqual([1, 2, 3, 4, 5]);
    const c = advance(c0, at + 900);
    expect([0, 1, 2, 4].map((i) => term(c, i))).toEqual([1, 1, 1, 1]);
    expect(leaderNow(c)?.id).toBe(0);
    expect(electionVerdict(c, "cut").text).toBe("S4 alone: term 5, no majority");
    // The leader took a write while S4 was away, so S4 is one entry behind.
    expect(c.servers[0].log).toHaveLength(4);
    expect(c.servers[0].commit).toBe(4);
    expect(c.servers[3].log).toHaveLength(3);
  });

  it("reconnect S4: S1 steps down to term 5, everyone refuses S4, and S3 wins term 6 about 210 ms later", () => {
    const cut = advance(cutS4(advance(initCluster(3), 130)), 900 + 130 + 5);
    const r = reconnect(cut);
    const at = r.now;
    const down = advance(r, at + 10);
    expect(down.servers[0].role).toBe("follower");
    expect(term(down, 0)).toBe(5);
    expect(down.servers[3].role).toBe("candidate");
    expect(liveLeaders(down)).toHaveLength(0);
    expect(electionVerdict(down, "reconnect").text).toBe("S4's old term forced a new election");
    expect(down.servers.every((s) => s.votedFor !== 3 || s.id === 3)).toBe(true);
    const won = advance(r, at + 220);
    expect(leaderNow(won)?.id).toBe(2);
    expect(term(won, 2)).toBe(6);
    expect(won.lastGap).toBe(210);
  });

  it("kill the leader and two followers: no majority, no leader, terms keep rising", () => {
    let c = killLeader(advance(initCluster(3), 100));
    c = killNext(killNext(c));
    expect(upCount(c)).toBe(2);
    const a = advance(c, c.now + 1500);
    const b = advance(c, c.now + 3000);
    expect(liveLeaders(b)).toHaveLength(0);
    const hi = (x: Cluster) => Math.max(...x.servers.filter((s) => s.up).map((s) => s.term));
    expect(hi(b)).toBeGreaterThan(hi(a));
    expect(electionVerdict(b, "other").text).toBe("No majority: no leader is possible");
  });

  it("is deterministic: the same presses at different phases give the same relative picture", () => {
    const a = killLeader(advance(initCluster(3), 100));
    const b = killLeader(advance(initCluster(3), 130));
    expect(advance(a, a.now + 210).servers.map((s) => [s.role, s.term])).toEqual(advance(b, b.now + 210).servers.map((s) => [s.role, s.term]));
  });

  it("the timer drains and every verdict fits in 38 characters", () => {
    const c0 = killLeader(initCluster(3));
    expect(timerLeft(c0, c0.servers[2])).toBe(1);
    expect(timerLeft(advance(c0, 95), c0.servers[2])).toBeCloseTo(0.5, 5);
    const texts: string[] = [];
    for (let t = 0; t <= 1200; t += 10) {
      for (const f of [killLeader, forceTie, cutS4]) texts.push(electionVerdict(advance(f(initCluster(3)), t), "kill").text, electionVerdict(advance(f(initCluster(3)), t), "cut").text);
    }
    expect(texts.filter((t) => t.length > 38)).toEqual([]);
  });
});

describe("raft cluster: logs", () => {
  const send = (c: Cluster, id: number, ms = 120) => advance(sendEntry(c, id), c.now + ms);

  it("three entries reach every log and commit on every server", () => {
    let c = initCluster(0);
    c = send(send(send(c, 0), 0), 0);
    expect(c.servers.every((s) => s.log.map((e) => e.cmd).join("") === "abc" && s.commit === 3)).toBe(true);
    expect(logVerdict(c, "send").text).toBe("Majority holds it: committed");
  });

  it("the cut script: d stays hollow, S3 leads term 2, heal erases d", () => {
    let c = initCluster(0);
    c = send(send(send(c, 0), 0), 0);
    c = cutHalf(c);
    c = send(c, 0, 40);
    expect(c.servers[0].log).toHaveLength(4);
    expect(c.servers[1].log).toHaveLength(4);
    expect([2, 3, 4].every((i) => c.servers[i].log.length === 3)).toBe(true);
    expect(c.servers[0].commit).toBe(3);
    expect(logVerdict(c, "send").text).toBe("2 of 5: stored, not committed");
    // Wait one timeout.
    c = advance(c, c.now + 400);
    expect(leaderNow(c)?.id).toBe(2);
    expect(term(c, 2)).toBe(2);
    expect(c.servers[0].role).toBe("leader");
    expect(term(c, 0)).toBe(1);
    expect([2, 3, 4].every((i) => c.servers[i].log.length === 4 && c.servers[i].log[3].term === 2 && c.servers[i].log[3].cmd === "")).toBe(true);
    expect(logVerdict(c, "send").text).toBe("Two leaders, only one can commit");
    // Send e to S3.
    c = send(c, 2, 150);
    expect([2, 3, 4].map((i) => [c.servers[i].log.length, c.servers[i].commit])).toEqual([[5, 5], [5, 5], [5, 5]]);
    expect(c.servers[0].commit).toBe(3);
    expect(c.servers[1].commit).toBe(3);
    expect(c.servers[0].log[3]).toEqual({ term: 1, cmd: "d" });
    // Heal.
    c = heal(c);
    c = advance(c, c.now + 200);
    expect(c.servers.map((s) => s.log.map((e) => e.cmd || ".").join(""))).toEqual(["abc.e", "abc.e", "abc.e", "abc.e", "abc.e"]);
    expect(c.servers.every((s) => s.commit === 5)).toBe(true);
    expect(liveLeaders(c).map((s) => s.id)).toEqual([2]);
    expect(c.erased).toEqual(["d"]);
    expect(logVerdict(c, "heal").text).toBe("d was never committed: erased");
    c = advance(c, c.now + 900);
    expect(logVerdict(c, "heal").text).toBe("All five logs match again");
  });

  it("kill a follower twice and f still commits; a third kill leaves f hollow", () => {
    let c = initCluster(0);
    c = send(send(send(c, 0), 0), 0);
    c = killNext(killNext(c));
    expect(upCount(c)).toBe(3);
    c = send(c, 0);
    expect(c.servers[0].commit).toBe(4);
    expect(logVerdict(c, "send").text).toBe("Majority holds it: committed");
    c = killNext(c);
    c = send(c, 0);
    expect(c.servers[0].commit).toBe(4);
    expect(c.servers[0].log).toHaveLength(5);
    expect(logVerdict(c, "send").text).toBe("2 of 5: no majority");
  });

  it("reads back as text for the live region", () => {
    const c = send(initCluster(0), 0);
    expect(logText(c, 1)).toBe("S2: a(term 1); committed up to 1");
    expect(stateLines(c)[0]).toBe("S1 leader term 1");
    const d = killNext(c);
    expect(stateLines(d)[4]).toBe("S5 down");
    expect(logText(d, 4)).toBe("S5 is down");
  });

  it("settles to a stable picture", () => {
    const c = settle(killLeader(initCluster(3)), (x) => liveLeaders(x).length > 0, 1500);
    expect(leaderNow(c)?.id).toBe(2);
    expect(cutHalf(cutHalf(initCluster(0)))).toBeTruthy();
  });
});

describe("raft playables: server render", () => {
  it("draw an svg with the limits fold and a verdict", () => {
    for (const spec of [sysdesignM12RaftElectionPlay, sysdesignM12RaftLogPlay]) {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).not.toMatch(/foreignObject|<animate|<use |<image/);
    }
    const election = renderToString(createElement(sysdesignM12RaftElectionPlay.component, { title: "t", purpose: "p", limits: "l" }));
    expect(election).toContain("S1 leads term 1: all quiet");
    expect(election).toContain("Kill the leader");
    const log = renderToString(createElement(sysdesignM12RaftLogPlay.component, { title: "t", purpose: "p", limits: "l" }));
    expect(log).toContain("Send an entry");
  });
});
