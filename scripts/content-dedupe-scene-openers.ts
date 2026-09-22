/**
 * Removes duplicate "Where the project is now" / "Why this step matters" opener
 * when the same sentence appears in frontmatter summary and body.
 * Run: tsx scripts/content-dedupe-scene-openers.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readLessonFiles, readModuleDirs } from "./import-course";

const COURSE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../content/import/multi-vendor-marketplace");

const PREFIXES = ["**Where the project is now:**", "**Why this step matters:**"];

function dedupeFile(filePath: string): boolean {
  const raw = fs.readFileSync(filePath, "utf8");
  const fmEnd = raw.indexOf("\n---\n", 4);
  if (fmEnd === -1) return false;
  const body = raw.slice(fmEnd + 5);
  const lines = body.split("\n");
  let changed = false;

  for (const prefix of PREFIXES) {
    const indices: number[] = [];
    for (let i = 0; i < Math.min(lines.length, 40); i++) {
      if (lines[i]!.trimStart().startsWith(prefix)) indices.push(i);
    }
    if (indices.length >= 2) {
      const first = lines[indices[0]!]!.trim();
      for (let j = 1; j < indices.length; j++) {
        const line = lines[indices[j]!]!.trim();
        if (line === first || line.startsWith(first.slice(0, 80))) {
          lines.splice(indices[j]!, 1);
          changed = true;
        }
      }
    }
  }

  if (!changed) return false;
  fs.writeFileSync(filePath, raw.slice(0, fmEnd + 5) + lines.join("\n"));
  return true;
}

let count = 0;
for (const { dirName } of readModuleDirs()) {
  if (dirName === "scripts") continue;
  for (const { fileName } of readLessonFiles(dirName)) {
    if (!/(set-the-scene|where-the-project-is-now|why-this-step)/.test(fileName)) continue;
    const filePath = path.join(COURSE_DIR, dirName, fileName);
    if (dedupeFile(filePath)) {
      count += 1;
      console.log("deduped:", `${dirName}/${fileName}`);
    }
  }
}
console.log(`Done — ${count} file(s) updated.`);
