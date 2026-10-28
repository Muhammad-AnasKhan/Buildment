import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Dot's brand files (moods for email and push, voice clips) are listed in one manifest; a listed
// file that is missing would show a broken image or play nothing.
const PUBLIC_DIR = fileURLToPath(new URL("../../../public", import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, "brand/dot/manifest.json"), "utf8")) as {
  moods: { mood: string; svg: string; png: string }[];
  clips: { key: string; text: string; file: string }[];
};

describe("Dot brand manifest", () => {
  it("has an SVG and a PNG for every mood", () => {
    for (const m of manifest.moods) {
      expect(fs.existsSync(path.join(PUBLIC_DIR, m.svg)), m.svg).toBe(true);
      expect(fs.existsSync(path.join(PUBLIC_DIR, m.png)), m.png).toBe(true);
    }
  });

  it("has a recorded clip for every line, with unique keys", () => {
    const keys = manifest.clips.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const c of manifest.clips) {
      expect(c.text.length, c.key).toBeGreaterThan(0);
      expect(fs.existsSync(path.join(PUBLIC_DIR, c.file)), c.file).toBe(true);
    }
  });
});
