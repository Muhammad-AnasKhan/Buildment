import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CUT_LINE, outputLines, validateReplay } from "@buildment/learning-ui/canvas/models/net-replay";
import { netM10ReplayChallenge7, netM10ReplayChallenge7Data } from "@buildment/learning-ui/canvas/net-m10-replay-challenge-7/data";
import { netM11ReplayChallenge8, netM11ReplayChallenge8Data } from "@buildment/learning-ui/canvas/net-m11-replay-challenge-8/data";
import { netM12ReplayToolbox, netM12ReplayToolboxData } from "@buildment/learning-ui/canvas/net-m12-replay-toolbox/data";
import { InteractiveCanvas } from "@buildment/learning-ui/canvas/InteractiveCanvas";
import { canvasRegistry } from "@buildment/learning-ui/canvas/registry";

// Part 2 of the networking course: the phone replays of challenges 7, 8 and 9.
// Each replay must be valid, registered, render on the server, and show only
// output that was really recorded. The recordings live in
// agent-ip/work/networking/recordings/; the frontend test copy reads the copies
// in tests/unit/canvas/fixtures/, and checks they match when the originals exist.

const REPLAYS = [
  { slug: "net-m10-replay-challenge-7", spec: netM10ReplayChallenge7, data: netM10ReplayChallenge7Data, recording: "challenge-7-sessions.txt" },
  { slug: "net-m11-replay-challenge-8", spec: netM11ReplayChallenge8, data: netM11ReplayChallenge8Data, recording: "challenge-8-sessions.txt" },
  { slug: "net-m12-replay-toolbox", spec: netM12ReplayToolbox, data: netM12ReplayToolboxData, recording: "challenge-9-sessions.txt" },
] as const;

const FIXTURES = path.join("tests", "unit", "canvas", "fixtures");
const ORIGINALS = path.join("..", "agent-ip", "work", "networking", "recordings");
// Compare lines without carriage returns, colour codes or trailing spaces.
const clean = (line: string) => line.replace(/\r/g, "").replace(/\u001b\[[0-9;]*m/g, "").trimEnd();
const recordedLines = (name: string) => new Set(fs.readFileSync(path.join(FIXTURES, name), "utf8").split("\n").map(clean));

describe("Part 2 replays", () => {
  for (const { slug, spec, data, recording } of REPLAYS) {
    describe(slug, () => {
      it("is a valid replay", () => {
        expect(validateReplay(data)).toEqual([]);
      });

      it("is registered under its slug", () => {
        expect(canvasRegistry[slug as keyof typeof canvasRegistry]).toBe(spec);
      });

      it("renders on the server", () => {
        const html = renderToString(createElement(InteractiveCanvas, { slug }));
        expect(html).toContain(spec.title);
        expect(html).not.toContain("not available right now");
      });

      it("shows only recorded output", () => {
        const lines = recordedLines(recording);
        data.steps.forEach((step, i) => {
          for (const line of outputLines(step.output)) {
            if (line === CUT_LINE || line.trim() === "") continue;
            expect(lines.has(clean(line)), `step ${i + 1}: ${line}`).toBe(true);
          }
        });
      });

      it("has no em dash", () => {
        expect(JSON.stringify(data)).not.toMatch(/—/);
      });

      it("keeps its fixture identical to the recording", () => {
        const original = path.join(ORIGINALS, recording);
        if (!fs.existsSync(original)) return;
        expect(fs.readFileSync(path.join(FIXTURES, recording), "utf8")).toBe(fs.readFileSync(original, "utf8"));
      });
    });
  }
});
