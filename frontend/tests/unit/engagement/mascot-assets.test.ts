import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DOT_CLIPS, dotClipUrl, type DotClip } from "@/shared/engagement/dot-voice";
import { MASCOTS } from "@/shared/engagement/mascots";
import { ENGAGEMENT_RULES } from "@/shared/engagement/rules";

// Mascot images and Dot's voice clips are served from public/, so a pose whose file is missing would
// show a broken image, and a line whose clip is missing would play nothing.
const PUBLIC_DIR = fileURLToPath(new URL("../../../public", import.meta.url));

describe("mascot assets", () => {
  it("has an image in public/ for every pose of every mascot", () => {
    for (const mascot of Object.values(MASCOTS)) {
      for (const [state, asset] of Object.entries(mascot.states)) {
        expect(fs.existsSync(path.join(PUBLIC_DIR, asset.image)), `${mascot.id} ${state}: ${asset.image}`).toBe(true);
      }
    }
  });

  it("has a file in public/ for every one of Dot's clips", () => {
    const missing = (Object.keys(DOT_CLIPS) as DotClip[]).filter(
      (clip) => !fs.existsSync(path.join(PUBLIC_DIR, dotClipUrl(clip)))
    );
    expect(missing, "record these clips (frontend/public/brand/dot/manifest.json)").toEqual([]);
  });

  it("matches the brand manifest's clips, word for word", () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, "brand/dot/manifest.json"), "utf8")) as {
      clips: { key: string; text: string; file: string }[];
    };
    const fromManifest = Object.fromEntries(manifest.clips.map((clip) => [clip.key, clip.text]));
    expect(fromManifest).toEqual(DOT_CLIPS);
    for (const clip of manifest.clips) expect(clip.file).toBe(dotClipUrl(clip.key as DotClip));
  });

  it("plays only clips that exist, from rules that say the clip's words", () => {
    for (const rule of ENGAGEMENT_RULES) {
      if (!rule.clip) continue;
      expect(DOT_CLIPS[rule.clip], rule.id).toBe(rule.messages[0]);
    }
  });
});
