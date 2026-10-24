import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The registry runs on the server. If a canvas data.ts calls a function that
// a "use client" module exports, Next throws on every page that loads the
// registry ("Attempted to call X() from the server"). Rendering in vitest does
// not see the client boundary, so this test reads the source instead.

const CANVAS = path.resolve(__dirname, "../../../src/canvas");

function clientModule(fromDir: string, spec: string): boolean {
  const base = path.resolve(fromDir, spec);
  const file = [".tsx", ".ts", "/index.tsx", "/index.ts"].map((ext) => base + ext).find((f) => fs.existsSync(f));
  return !!file && /^\s*["']use client["']/.test(fs.readFileSync(file, "utf8"));
}

describe("canvas data files and the client boundary", () => {
  it("never call a function from a \"use client\" module", () => {
    const problems: string[] = [];
    for (const dir of fs.readdirSync(CANVAS)) {
      const data = path.join(CANVAS, dir, "data.ts");
      if (!fs.existsSync(data)) continue;
      const src = fs.readFileSync(data, "utf8");
      for (const m of src.matchAll(/^import\s+\{([^}]+)\}\s+from\s+"(\.[^"]+)";/gm)) {
        if (!clientModule(path.dirname(data), m[2])) continue;
        const names = m[1].split(",").map((n) => n.trim()).filter((n) => n && !n.startsWith("type "));
        for (const name of names) if (new RegExp(`\\b${name}\\s*\\(`).test(src)) problems.push(`${dir}: calls ${name}() from ${m[2]}`);
      }
    }
    expect(problems).toEqual([]);
  }, 30_000);
});
