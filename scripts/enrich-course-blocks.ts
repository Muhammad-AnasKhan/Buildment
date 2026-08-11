/**
 * Inject BigWordAlert, MandatoryReadCard, InterestingRead, RealWorldEvent, ArticleBreak
 * into course import markdown at contextual anchors (not stacked at the top).
 *
 * Run: npx tsx scripts/enrich-course-blocks.ts
 * Then: npm run content:import
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  enrichmentForModule,
  moduleNumFromPath,
  type BigWord,
  type Interesting,
  type MandatoryRead,
  type RealWorld,
  type Article,
} from "./course-enrichment-data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSE_DIR = path.resolve(__dirname, "../content/import/multi-vendor-marketplace");

type AnchorKind =
  | "afterIntro"
  | "beforeBridge"
  | "afterBridge"
  | "beforeBuild"
  | "midChapter"
  | "beforeNext"
  | "end";

type BlockPlacement = {
  mdx: string;
  anchor: AnchorKind;
};

function escapeAttr(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function bigWordMdx(w: BigWord): string {
  if (w.whyItMatters) {
    return `<BigWordAlert term="${escapeAttr(w.term)}" plainEnglish="${escapeAttr(w.plainEnglish)}" whyItMatters="${escapeAttr(w.whyItMatters)}" />`;
  }
  return `<BigWordAlert term="${escapeAttr(w.term)}" plainEnglish="${escapeAttr(w.plainEnglish)}" />`;
}

function mandatoryMdx(r: MandatoryRead): string {
  const sourceLine = r.source ? `\n  source="${escapeAttr(r.source)}"` : "";
  const minutes = r.readMinutes ?? 8;
  return `<MandatoryReadCard
  title="${escapeAttr(r.title)}"
  href="${escapeAttr(r.href)}"${sourceLine}
  summary="${escapeAttr(r.summary)}"
  readMinutes={${minutes}}
/>`;
}

function interestingMdx(i: Interesting): string {
  const body = i.body.replace(/\n/g, "\n\n");
  return `<InterestingRead title="${escapeAttr(i.title)}" hook="${escapeAttr(i.hook)}" readMinutes={${i.readMinutes}}>

${body}

</InterestingRead>`;
}

function realWorldMdx(r: RealWorld): string {
  return `<RealWorldEvent title="${escapeAttr(r.title)}" when="${escapeAttr(r.when)}" summary="${escapeAttr(r.summary)}" lesson="${escapeAttr(r.lesson)}" />`;
}

function articleMdx(a: Article): string {
  const body = a.body.replace(/\n/g, "\n\n");
  const subtitle = a.subtitle ? ` subtitle="${escapeAttr(a.subtitle)}"` : "";
  return `<ArticleBreak title="${escapeAttr(a.title)}"${subtitle} readMinutes={${a.readMinutes}}>

${body}

</ArticleBreak>`;
}

type LessonKind =
  | "set-the-scene"
  | "what-youll-build"
  | "prime"
  | "trap"
  | "learn"
  | "build"
  | "checklist"
  | "recap"
  | "quiz"
  | "other";

function lessonKind(filename: string): LessonKind {
  if (filename.includes("set-the-scene")) return "set-the-scene";
  if (filename.includes("what-youll-build")) return "what-youll-build";
  if (filename.includes("prime-your-thinking")) return "prime";
  if (filename.includes("-trap") || filename.includes("why-")) return "trap";
  if (filename.includes("checklist")) return "checklist";
  if (filename.includes("recap-and-whats-next")) return "recap";
  if (filename.includes("quiz")) return "quiz";
  if (/-\d{2}-/.test(filename)) {
    const step = filename.match(/-(\d{2})-/)?.[1];
    const n = step ? parseInt(step, 10) : 0;
    if (n >= 4 && n <= 7) return "learn";
    if (n >= 8) return "build";
  }
  return "other";
}

function hashPick<T>(seed: string, arr: T[], offset = 0): T {
  let h = offset;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length]!;
}

/** Remove previously injected enrichment blocks so placement can be recomputed. */
export function stripEnrichmentBlocks(body: string): string {
  let result = body;
  result = result.replace(/<BigWordAlert[\s\S]*?\/>/g, "");
  result = result.replace(/<MandatoryReadCard[\s\S]*?\/>/g, "");
  result = result.replace(/<RealWorldEvent[\s\S]*?\/>/g, "");
  result = result.replace(/<InterestingRead[\s\S]*?<\/InterestingRead>/g, "");
  result = result.replace(/<ArticleBreak[\s\S]*?<\/ArticleBreak>/g, "");
  result = result.replace(/\n{3,}/g, "\n\n");
  return result.trimEnd() + (result.endsWith("\n") ? "" : "\n");
}

function findHeadingLine(lines: string[], pattern: RegExp): number {
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i] ?? "")) return i;
  }
  return -1;
}

function findAfterIntro(lines: string[]): number {
  let i = 0;
  if (lines[0] === "---") {
    i = 1;
    while (i < lines.length && lines[i] !== "---") i++;
    i += 1;
  }

  while (i < lines.length && !lines[i]?.startsWith("# ")) i++;
  i += 1;

  while (i < lines.length && (lines[i]?.startsWith(">") || lines[i]?.trim() === "")) i++;

  while (i < lines.length && lines[i]?.trim() !== "" && !lines[i]?.startsWith("##")) {
    i += 1;
  }

  while (i < lines.length && lines[i]?.trim() === "") i++;
  return i;
}

function findFirstBuildStep(lines: string[]): number {
  const patterns = [
    /^## Step \d/i,
    /^## Before you start/i,
    /^## Build\b/i,
    /^## Implement/i,
    /^## Scaffold/i,
    /^## Create the/i,
    /^## Wire the/i,
    /^## Add the/i,
    /^## Run the/i,
    /^## Test with/i,
    /^## Verify/i,
  ];
  for (let i = 0; i < lines.length; i++) {
    if (patterns.some((p) => p.test(lines[i] ?? ""))) return i;
  }
  return -1;
}

function collectHeadingLines(lines: string[]): number[] {
  const headings: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^## /.test(lines[i] ?? "")) headings.push(i);
  }
  return headings;
}

function findMidChapter(lines: string[], seed: string): number {
  const headings = collectHeadingLines(lines);
  if (headings.length === 0) return lines.length;
  const pick = hashPick(seed, headings, 2);
  const pickIdx = headings.indexOf(pick);
  const next = headings[pickIdx + 1];
  return next ?? lines.length;
}

function resolveAnchorLine(lines: string[], anchor: AnchorKind, seed: string): number {
  switch (anchor) {
    case "afterIntro":
      return findAfterIntro(lines);
    case "beforeBridge": {
      const bridge = findHeadingLine(lines, /^## Bridge/);
      return bridge >= 0 ? bridge : findMidChapter(lines, seed);
    }
    case "afterBridge": {
      const bridge = findHeadingLine(lines, /^## Bridge/);
      if (bridge >= 0) {
        for (let i = bridge + 1; i < lines.length; i++) {
          if (/^## /.test(lines[i] ?? "")) return i;
        }
        return lines.length;
      }
      return findMidChapter(lines, seed);
    }
    case "beforeBuild": {
      const build = findFirstBuildStep(lines);
      return build >= 0 ? build : findMidChapter(lines, seed);
    }
    case "midChapter":
      return findMidChapter(lines, seed);
    case "beforeNext": {
      const next = findHeadingLine(lines, /^## (Next|Key ideas|Before you continue|Reflect|What's next)/i);
      return next >= 0 ? next : lines.length;
    }
    case "end":
      return lines.length;
    default:
      return lines.length;
  }
}

function insertAtLine(lines: string[], lineIndex: number, mdx: string): void {
  const idx = lineIndex < 0 ? lines.length : lineIndex;
  lines.splice(idx, 0, mdx.trim(), "");
}

function applyPlacements(body: string, placements: BlockPlacement[], seed: string): string {
  if (placements.length === 0) return body;

  const lines = body.split("\n");
  const byLine = new Map<number, string[]>();

  for (const { mdx, anchor } of placements) {
    const line = resolveAnchorLine(lines, anchor, seed);
    const group = byLine.get(line) ?? [];
    group.push(mdx);
    byLine.set(line, group);
  }

  const sortedLines = [...byLine.keys()].sort((a, b) => b - a);
  for (const line of sortedLines) {
    insertAtLine(lines, line, byLine.get(line)!.join("\n\n"));
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

function buildPlacements(
  relPath: string,
  filename: string,
  data: NonNullable<ReturnType<typeof enrichmentForModule>>,
  kind: LessonKind
): BlockPlacement[] {
  const seed = filename;
  const placements: BlockPlacement[] = [];

  if (kind === "build" && data.bigWords[1]) {
    placements.push({ mdx: bigWordMdx(data.bigWords[1]), anchor: "afterIntro" });
  } else {
    placements.push({ mdx: bigWordMdx(hashPick(seed, data.bigWords, 0)), anchor: "afterIntro" });
  }

  if (kind === "set-the-scene") {
    if (data.articleBreak) {
      placements.push({ mdx: articleMdx(data.articleBreak), anchor: "beforeBridge" });
    }
    placements.push({ mdx: mandatoryMdx(data.mandatoryRead), anchor: "beforeBuild" });
    placements.push({ mdx: interestingMdx(data.interesting), anchor: "beforeNext" });
    placements.push({ mdx: realWorldMdx(data.realWorld), anchor: "afterBridge" });
  } else if (kind === "what-youll-build") {
    placements.push({ mdx: mandatoryMdx(data.mandatoryRead), anchor: "midChapter" });
    placements.push({ mdx: realWorldMdx(data.realWorld), anchor: "midChapter" });
    placements.push({ mdx: interestingMdx(data.interesting), anchor: "end" });
  } else if (kind === "prime" || kind === "trap" || kind === "learn") {
    placements.push({ mdx: realWorldMdx(data.realWorld), anchor: "midChapter" });
    placements.push({ mdx: interestingMdx(data.interesting), anchor: "beforeNext" });
  } else if (kind === "build") {
    const lessonNum = parseInt(filename.match(/-(\d{2})-/)?.[1] ?? "0", 10);
    if (lessonNum % 3 === 0) {
      placements.push({ mdx: interestingMdx(data.interesting), anchor: "end" });
    }
    if (lessonNum % 5 === 0) {
      placements.push({ mdx: realWorldMdx(data.realWorld), anchor: "midChapter" });
    }
  } else if (kind === "checklist" || kind === "recap") {
    placements.push({ mdx: interestingMdx(data.interesting), anchor: "beforeNext" });
    placements.push({ mdx: realWorldMdx(data.realWorld), anchor: "end" });
  } else if (kind === "quiz") {
    placements.push({ mdx: interestingMdx(data.interesting), anchor: "end" });
  } else if (kind === "other") {
    placements.push({ mdx: realWorldMdx(data.realWorld), anchor: "beforeNext" });
  }

  return placements;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else if (ent.name.endsWith(".md") && ent.name !== "COURSE-OUTLINE.md") out.push(full);
  }
  return out;
}

function main() {
  const files = walk(COURSE_DIR);
  let stripped = 0;
  let updated = 0;

  for (const file of files) {
    const rel = path.relative(COURSE_DIR, file);
    const filename = path.basename(file);
    const original = fs.readFileSync(file, "utf8");
    let body = stripEnrichmentBlocks(original);
    if (body !== original) stripped++;

    const mod = moduleNumFromPath(rel);
    if (mod == null) continue;
    const data = enrichmentForModule(mod);
    if (!data) continue;

    const kind = lessonKind(filename);
    const placements = buildPlacements(rel, filename, data, kind);
    const next = applyPlacements(body, placements, filename);

    if (next !== original) {
      fs.writeFileSync(file, next);
      updated++;
    }
  }

  console.log(`Stripped enrichment from ${stripped} files. Re-enriched ${updated} of ${files.length} chapter files.`);
}

main();
