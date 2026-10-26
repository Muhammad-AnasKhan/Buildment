import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isSafeAssetUrl } from "@/shared/lib/asset-url";

// Listen-along audio for a chapter. `agent-ip/scripts/narrate/narrate.py` writes the audio and a
// `manifest.json` per course; any course with a manifest entry for a chapter gets a Listen player,
// with no database change. By default the files are served from the web app's public folder
// (`public/narration/<course>/`). Set NARRATION_BASE_URL to an https address to serve the same
// layout from object storage instead, which keeps large audio out of the app image.

export type ChapterNarration = { src: string; minutes: number; bytes: number };

const LOCAL_BASE = "/narration";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHAPTER_SLUG = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const AUDIO_FILE = /^[\w.-]+\.mp3$/;

export function narrationBase(configured: string | undefined = process.env.NARRATION_BASE_URL): string {
  const base = configured?.trim().replace(/\/+$/, "");
  return base && isSafeAssetUrl(base) ? base : LOCAL_BASE;
}

/** The chapter's entry from a parsed manifest, or null when it has no valid audio. */
export function pickNarration(manifest: unknown, base: string, courseSlug: string, chapterSlug: string): ChapterNarration | null {
  if (!manifest || typeof manifest !== "object") return null;
  const chapters = (manifest as { chapters?: unknown }).chapters;
  if (!chapters || typeof chapters !== "object") return null;
  const entry = (chapters as Record<string, unknown>)[chapterSlug];
  if (!entry || typeof entry !== "object") return null;
  const { file, minutes, bytes } = entry as Record<string, unknown>;
  if (typeof file !== "string" || !AUDIO_FILE.test(file)) return null;
  if (typeof minutes !== "number" || !(minutes > 0) || typeof bytes !== "number" || !(bytes > 0)) return null;
  return { src: `${base}/${courseSlug}/${file}`, minutes, bytes };
}

async function readManifest(base: string, courseSlug: string): Promise<unknown> {
  if (base === LOCAL_BASE) {
    const file = path.join(process.cwd(), "public", "narration", courseSlug, "manifest.json");
    return JSON.parse(await readFile(file, "utf8"));
  }
  const response = await fetch(`${base}/${courseSlug}/manifest.json`, { next: { revalidate: 300 } });
  return response.ok ? response.json() : null;
}

/** Never throws: reading a chapter must work whether or not audio exists or the storage is reachable. */
export async function loadChapterNarration(courseSlug: string, chapterSlug: string): Promise<ChapterNarration | null> {
  if (!SLUG.test(courseSlug) || !CHAPTER_SLUG.test(chapterSlug)) return null;
  try {
    const base = narrationBase();
    return pickNarration(await readManifest(base, courseSlug), base, courseSlug, chapterSlug);
  } catch {
    return null;
  }
}
