import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  checkCommitStory,
  commitLines,
  dotPositions,
  dotRadius,
  historyStats,
  type CommitHistory,
  type CommitStoryConfig,
  type StoryCommit,
} from "@buildment/learning-ui/canvas/models/commit-story";
import { makeCommitStoryCanvas } from "@buildment/learning-ui/canvas/primitives/canvas-factories";

const commit = (id: string, day: number, added: number, removed = 0, files = 1): StoryCommit => ({ id, message: `Commit ${id}`, day, files, added, removed, note: `Note ${id}` });

const dump: CommitHistory = { id: "dump", label: "One dump", commits: [commit("d1", 6, 4800, 12, 23)], verdict: "A reviewer cannot follow it", tone: "bad" };
const steps: CommitHistory = {
  id: "steps",
  label: "Small steps",
  commits: [commit("s1", 1, 40), commit("s2", 2, 120, 10, 3), commit("s3", 2, 60, 5), commit("s4", 4, 300, 40, 6), commit("s5", 6, 80, 2)],
  verdict: "A reviewer can follow every step",
  tone: "good",
};
const config: CommitStoryConfig = { histories: [dump, steps], hint: "Tap a dot." };

describe("commit story model", () => {
  it("counts commits, lines, the largest commit and the span of days", () => {
    expect(historyStats(dump)).toEqual({ commits: 1, totalLines: 4812, largestLines: 4812, days: 1 });
    expect(historyStats(steps)).toEqual({ commits: 5, totalLines: 40 + 130 + 65 + 340 + 82, largestLines: 340, days: 6 });
    expect(historyStats({ ...dump, commits: [] })).toEqual({ commits: 0, totalLines: 0, largestLines: 0, days: 0 });
  });

  it("measures a commit as lines added plus removed", () => {
    expect(commitLines(commit("x", 1, 7, 3))).toBe(10);
  });

  it("grows dots with lines changed but clamps them", () => {
    expect(dotRadius(0)).toBe(6);
    expect(dotRadius(50)).toBeLessThan(dotRadius(500));
    expect(dotRadius(5000)).toBe(26);
    expect(dotRadius(1_000_000)).toBe(26);
    expect(dotRadius(-5)).toBe(6);
  });

  it("places dots by day, keeps them apart and inside the lane", () => {
    const xs = dotPositions(steps.commits, 1, 6, 36, 384);
    expect(xs).toHaveLength(5);
    expect(xs[0]).toBe(36);
    expect(xs[4]).toBe(384);
    for (let i = 1; i < xs.length; i++) {
      const gap = xs[i] - xs[i - 1];
      expect(gap).toBeGreaterThanOrEqual(dotRadius(commitLines(steps.commits[i])) + dotRadius(commitLines(steps.commits[i - 1])));
    }
    expect(dotPositions(dump.commits, 6, 6, 36, 384)).toEqual([210]);
    expect(dotPositions([], 1, 1, 36, 384)).toEqual([]);
  });

  it("shifts a crowded end back inside the lane", () => {
    const crowd = [commit("a", 1, 5000), commit("b", 9, 5000), commit("c", 10, 5000)];
    const xs = dotPositions(crowd, 1, 10, 36, 384);
    expect(Math.max(...xs)).toBeLessThanOrEqual(384);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(36);
  });
});

describe("checkCommitStory", () => {
  it("accepts good histories", () => {
    expect(checkCommitStory(config)).toEqual([]);
  });

  it("flags a wrong number of histories and duplicate ids", () => {
    expect(checkCommitStory({ ...config, histories: [dump] as unknown as CommitStoryConfig["histories"] }).join("\n")).toContain("1 histories, need exactly 2");
    const dup = checkCommitStory({ ...config, histories: [dump, { ...steps, id: "dump", commits: [commit("a", 1, 1), commit("a", 2, 1)] }] }).join("\n");
    expect(dup).toContain("history dump: duplicate id");
    expect(dup).toContain("commit a: duplicate id");
  });

  it("flags days out of order and negative counts", () => {
    const bad = { ...steps, commits: [commit("a", 3, 1), commit("b", 2, -4, 0, -1)] };
    const problems = checkCommitStory({ ...config, histories: [dump, bad] }).join("\n");
    expect(problems).toContain("commit b: day 2 is before the previous commit");
    expect(problems).toContain("commit b: added is -4");
    expect(problems).toContain("commit b: files is -1");
  });

  it("flags empty or oversized histories", () => {
    const many = { ...steps, commits: Array.from({ length: 13 }, (_, i) => commit(`c${i}`, i + 1, 1)) };
    expect(checkCommitStory({ ...config, histories: [{ ...dump, commits: [] }, many] }).join("\n")).toMatch(/0 commits, need 1 to 12[\s\S]*13 commits, need 1 to 12/);
  });
});

describe("commit story canvas", () => {
  it("server-renders the first history with its first commit selected", () => {
    const Canvas = makeCommitStoryCanvas(config);
    const html = renderToString(createElement(Canvas, { title: "Two histories", purpose: "p", limits: "Fictional commits." })).replaceAll("<!-- -->", "");
    expect(html).toContain("<svg");
    expect(html).toContain("1 commit, 4,812 lines, largest 4,812");
    expect(html).toContain("A reviewer cannot follow it");
    expect(html).toContain("Commit d1");
    expect(html).toContain("+4,800");
    expect(html).toContain("23 files");
    expect(html).toContain("What this picture leaves out");
    expect(html).toContain("One dump");
    expect(html).toContain("Small steps");
    expect(html.match(/role="button"/g)?.length).toBe(1);
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(1);
  });
});
