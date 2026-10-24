import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  N_LADDER,
  RESPONSE_MS,
  clampQuorum,
  majority,
  pingAt,
  quorumState,
  survivePill,
  timePill,
  toggleDown,
} from "@buildment/learning-ui/canvas/models/quorum-explorer";
import {
  PAUSE,
  PAUSE_SNAPS,
  clampPause,
  fencingState,
  formatSeconds,
  pauseFromFraction,
  pauseKey,
  pauseToFraction,
  wakeAt,
} from "@buildment/learning-ui/canvas/models/fencing-play";
import { ladderStep } from "@buildment/learning-ui/canvas/primitives/picture-slider";
import { sysdesignM12QuorumExplorer } from "@buildment/learning-ui/canvas/sysdesign-m12-quorum-explorer/data";
import { sysdesignM12FencingPlay } from "@buildment/learning-ui/canvas/sysdesign-m12-fencing-play/data";

const DASH = String.fromCharCode(0x2014);

describe("quorum explorer model", () => {
  it("computes the majority", () => {
    expect([3, 5, 7, 9].map(majority)).toEqual([2, 3, 4, 5]);
  });

  // [N, W, R, overlap, writes survive, reads survive, write ms, read ms]
  const rows: [number, number, number, boolean, number, number, number, number][] = [
    [3, 2, 2, true, 1, 1, 15, 15],
    [3, 1, 3, true, 2, 0, 10, 25],
    [3, 1, 1, false, 2, 2, 10, 10],
    [5, 3, 3, true, 2, 2, 25, 25],
    [5, 2, 3, false, 3, 2, 15, 25],
    [5, 1, 5, true, 4, 0, 10, 70],
    [5, 5, 1, true, 0, 4, 70, 10],
    [9, 5, 5, true, 4, 4, 70, 70],
  ];
  for (const [n, w, r, overlap, ws, rs, wms, rms] of rows) {
    it(`matches the table for N=${n}, W=${w}, R=${r}`, () => {
      const s = quorumState(n, w, r);
      expect(s.guaranteed).toBe(overlap);
      expect(s.writesSurvive).toBe(ws);
      expect(s.readsSurvive).toBe(rs);
      expect(s.writeMs).toBe(wms);
      expect(s.readMs).toBe(rms);
      expect(s.verdict.text).toBe(overlap ? "Overlap: every read meets a write" : "No overlap: a read can miss a write");
      if (overlap) {
        expect(s.shared.length).toBeGreaterThanOrEqual(w + r - n);
        expect(s.shared.length).toBeGreaterThan(0);
      } else {
        expect(s.shared).toEqual([]);
        expect(s.gap).not.toBeNull();
      }
    });
  }

  it("rings the W fastest and the R slowest copies", () => {
    const s = quorumState(5, 3, 3);
    expect(s.writeGroup).toEqual([0, 1, 2]);
    expect(s.readGroup).toEqual([2, 3, 4]);
    expect(s.shared).toEqual([2]);
    const apart = quorumState(5, 2, 3);
    expect(apart.writeGroup).toEqual([0, 1]);
    expect(apart.readGroup).toEqual([2, 3, 4]);
    expect(apart.gap).toEqual([1, 2]);
  });

  it("still works with replicas 4 and 5 failed, and blocks when replica 3 fails too", () => {
    const two = quorumState(5, 3, 3, [3, 4]);
    expect(two.writeBlocked).toBe(false);
    expect(two.readBlocked).toBe(false);
    expect(two.writeMs).toBe(25);
    expect(two.readMs).toBe(25);
    expect(two.verdict.text).toBe("Overlap: every read meets a write");
    const three = quorumState(5, 3, 3, [2, 3, 4]);
    expect(three.writeBlocked).toBe(true);
    expect(three.readBlocked).toBe(true);
    expect(three.writeMs).toBeNull();
    expect(three.writeGroup).toEqual([]);
    expect(three.verdict).toEqual({ text: "Writes blocked: too few nodes up", tone: "bad" });
    expect(timePill(three)).toBe("write and read blocked");
  });

  it("lets a blocked verdict win, and names reads when only reads are blocked", () => {
    const readsOnly = quorumState(5, 1, 5, [4]);
    expect(readsOnly.writeBlocked).toBe(false);
    expect(readsOnly.readBlocked).toBe(true);
    expect(readsOnly.verdict.text).toBe("Reads blocked: too few nodes up");
    expect(timePill(readsOnly)).toBe("write 10 ms, read blocked");
    expect(quorumState(5, 5, 1, [4]).verdict.text).toBe("Writes blocked: too few nodes up");
  });

  it("slides the read and write time to the next copy when a fast one fails", () => {
    const s = quorumState(5, 3, 3, [0]);
    expect(s.writeMs).toBe(40);
    expect(s.readMs).toBe(40);
  });

  it("clamps W and R when N changes and ignores down copies beyond N", () => {
    expect(clampQuorum(3, 5, 4)).toEqual({ n: 3, w: 3, r: 3 });
    expect(clampQuorum(4, 2, 2).n).toBe(5);
    expect(clampQuorum(9, 0, 99)).toEqual({ n: 9, w: 1, r: 9 });
    expect(quorumState(3, 2, 2, [7, 8]).down).toEqual([]);
  });

  it("keeps every verdict and pill short", () => {
    for (const n of N_LADDER) {
      for (let w = 1; w <= n; w++) {
        for (let r = 1; r <= n; r++) {
          for (const down of [[], [0], [n - 1], Array.from({ length: n }, (_, i) => i)]) {
            const s = quorumState(n, w, r, down);
            expect(s.verdict.text.length).toBeLessThanOrEqual(38);
            expect(Number.isFinite(s.writesSurvive)).toBe(true);
            expect(timePill(s).length).toBeLessThanOrEqual(26);
          }
        }
      }
    }
    expect(survivePill("writes", 2)).toBe("writes survive 2");
  });

  it("toggles a copy down and up, and times pings by response time", () => {
    expect(toggleDown([], 3)).toEqual([3]);
    expect(toggleDown([3], 3)).toEqual([]);
    expect(toggleDown([4], 1)).toEqual([1, 4]);
    expect(RESPONSE_MS.length).toBe(9);
    expect(pingAt(10)).toBeLessThan(pingAt(500));
    expect(pingAt(500)).toBeLessThan(3.2 - 0.6);
  });
});

describe("fencing model", () => {
  it("wakes A at 2 + P", () => {
    expect(wakeAt(14)).toBe(16);
    expect(wakeAt(0)).toBe(2);
    expect(wakeAt(20)).toBe(22);
  });

  it("is fine for a pause up to 8 s, with or without fencing", () => {
    for (const p of [0, 2, 5, 8]) {
      for (const f of [false, true]) {
        const s = fencingState(p, f);
        expect(s.kind).toBe("inside");
        expect(s.verdict).toEqual({ text: "A woke inside its lease: all fine", tone: "good" });
        expect(s.writes.map((w) => [w.who, w.accepted])).toEqual([["A", true], ["B", true]]);
        expect(s.stored).toBe("B");
      }
    }
  });

  it("lands A's late write before B's between 8 and 9 s, even with fencing", () => {
    for (const f of [false, true]) {
      const s = fencingState(8.5, f);
      expect(s.kind).toBe("late");
      expect(s.verdict.text).toBe("Late, but B had not written yet");
      expect(s.writes.map((w) => w.who)).toEqual(["A", "B"]);
      expect(s.writes.every((w) => w.accepted)).toBe(true);
      expect(s.stored).toBe("B");
    }
  });

  it("lets A overwrite B from 9 s with fencing off", () => {
    for (const p of [9, 14, 20]) {
      const s = fencingState(p, false);
      expect(s.kind).toBe("overwrite");
      expect(s.verdict).toEqual({ text: "A overwrote B's newer write", tone: "bad" });
      expect(s.writes.map((w) => w.who)).toEqual(["B", "A"]);
      expect(s.stored).toBe("A");
    }
  });

  it("rejects token 33 from 9 s with fencing on", () => {
    for (const p of [9, 14, 20]) {
      const s = fencingState(p, true);
      expect(s.kind).toBe("rejected");
      expect(s.verdict).toEqual({ text: "Token 33 rejected: B's write stands", tone: "good" });
      expect(s.writes[1]).toMatchObject({ who: "A", token: 33, accepted: false });
      expect(s.stored).toBe("B");
      expect(s.highestToken).toBe(34);
    }
  });

  it("sends the tie at 9 s to B first", () => {
    const s = fencingState(9, true);
    expect(s.wake).toBe(11);
    expect(s.writes.map((w) => w.who)).toEqual(["B", "A"]);
  });

  it("keeps verdicts at 38 characters or fewer over the whole rail", () => {
    for (let p = 0; p <= 20; p += 0.5) {
      for (const f of [false, true]) expect(fencingState(p, f).verdict.text.length).toBeLessThanOrEqual(38);
    }
  });

  it("steps by half a second and five on Page keys, and clamps", () => {
    expect(pauseKey(14, "ArrowRight")).toBe(14.5);
    expect(pauseKey(14, "ArrowLeft")).toBe(13.5);
    expect(pauseKey(14, "PageUp")).toBe(19);
    expect(pauseKey(18, "PageUp")).toBe(20);
    expect(pauseKey(2, "PageDown")).toBe(0);
    expect(pauseKey(5, "Home")).toBe(0);
    expect(pauseKey(5, "End")).toBe(20);
    expect(pauseKey(5, "a")).toBeNull();
    expect(clampPause(8.2)).toBe(8);
    expect(clampPause(Number.NaN)).toBe(PAUSE.default);
  });

  it("maps the rail position to the pause and back, and every snap point sits on the half second grid", () => {
    expect(pauseFromFraction(0)).toBe(0);
    expect(pauseFromFraction(1)).toBe(20);
    expect(pauseFromFraction(0.45)).toBe(9);
    for (const s of PAUSE_SNAPS) expect(pauseFromFraction(pauseToFraction(s))).toBe(s);
    expect(formatSeconds(8.5)).toBe("8.5");
    expect(formatSeconds(14)).toBe("14");
  });

  it("agrees with the shared slider ladder helper on the arrow step", () => {
    const ladder = Array.from({ length: 41 }, (_, i) => i / 2);
    expect(ladderStep(ladder, 14, "ArrowRight")).toBe(pauseKey(14, "ArrowRight"));
  });
});

describe("M12 quorum and fencing canvases", () => {
  const specs = [sysdesignM12QuorumExplorer, sysdesignM12FencingPlay];
  for (const spec of specs) {
    it(`renders ${spec.title} with its picture and its limits fold`, () => {
      const html = renderToString(createElement(spec.component, { title: spec.title, purpose: spec.purpose, limits: spec.limits }));
      expect(html).toContain("<svg");
      expect(html).toContain("What this picture leaves out");
      expect(html).toContain('role="slider"');
      expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(html).not.toContain(DASH);
    });
  }

  it("renders the default verdicts and the switch", () => {
    const q = renderToString(createElement(sysdesignM12QuorumExplorer.component, { title: "t", purpose: "p", limits: "l" }));
    expect(q).toContain("Overlap: every read meets a write");
    expect(q).toContain("writes survive 2");
    expect(q).toContain("write 25 ms, read 25 ms");
    const f = renderToString(createElement(sysdesignM12FencingPlay.component, { title: "t", purpose: "p", limits: "l" }));
    expect(f).toContain("A overwrote B&#x27;s newer write");
    expect(f).toContain('role="switch"');
    expect(f).toContain("pause 14 s, A wakes at 16 s");
  });

  it("keeps the wording free of em dashes and the drawing free of hex colours and banned SVG parts", () => {
    for (const spec of specs) expect(spec.title + spec.purpose + spec.limits).not.toContain(DASH);
    const root = path.resolve(__dirname, "../../../../packages/learning-ui/src/canvas");
    const files = [
      ...["sysdesign-m12-quorum-explorer", "sysdesign-m12-fencing-play"].flatMap((d) =>
        fs.readdirSync(path.join(root, d)).map((f) => path.join(root, d, f))
      ),
      path.join(root, "primitives/tight-rail-slider.tsx"),
      path.join(root, "models/quorum-explorer.ts"),
      path.join(root, "models/fencing-play.ts"),
    ];
    expect(files.length).toBeGreaterThanOrEqual(9);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}(?![\w-])/);
      expect(src, f).not.toMatch(/foreignObject|<animate|<use[ >]|<image[ >]/);
      expect(src, f).not.toContain(DASH);
    }
  });
});
