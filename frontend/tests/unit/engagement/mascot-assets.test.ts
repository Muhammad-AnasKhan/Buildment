import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MASCOTS, PAGE_AREAS, resolveMascot } from "@/shared/engagement/mascots";
import { ENGAGEMENT_RULES } from "@/shared/engagement/rules";

// Mascot images and voice clips are served from public/, so a pose whose file is missing would show
// a broken image, and a line whose clip is missing would play nothing.
const PUBLIC_DIR = fileURLToPath(new URL("../../../public", import.meta.url));

describe("mascot assets", () => {
  it("has an image in public/ for every pose of every mascot", () => {
    for (const mascot of Object.values(MASCOTS)) {
      for (const [state, asset] of Object.entries(mascot.states)) {
        expect(fs.existsSync(path.join(PUBLIC_DIR, asset.image)), `${mascot.id} ${state}: ${asset.image}`).toBe(true);
      }
    }
  });

  it("has a voice clip for every line a voiced mascot can be cast to say", () => {
    const missing = new Set<string>();
    for (const rule of ENGAGEMENT_RULES) {
      for (const area of [null, ...PAGE_AREAS]) {
        const { mascot } = resolveMascot({ role: rule.role, state: rule.state, mascot: rule.mascot, area });
        if (!mascot.voiced) continue;
        rule.messages.forEach((_, index) => {
          const clip = `mascots/voice/${mascot.id}/${rule.id}-${index}.mp3`;
          if (!fs.existsSync(path.join(PUBLIC_DIR, clip))) missing.add(clip);
        });
      }
    }
    expect([...missing], "regenerate these clips (docs/13-engagement.mdx, Voice)").toEqual([]);
  });
});
