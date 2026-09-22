/**
 * Removes legacy ```code``` fences and "Try it yourself" sections from import source.
 * Run: pnpm content:strip-code
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readLessonFiles, readModuleDirs } from "./import-course";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../content/import/multi-vendor-marketplace");

function stripBody(body: string): string {
  let out = body.replace(/```code\n[\s\S]*?```/g, "");
  out = out.replace(
    /## Try it yourself\n\n[\s\S]*?(?=\n## |\n<[A-Z]|$)/m,
    ""
  );
  return out.replace(/\n{3,}/g, "\n\n");
}

let touched = 0;
for (const { dirName } of readModuleDirs()) {
  for (const { fileName } of readLessonFiles(dirName)) {
    const filePath = path.join(ROOT, dirName, fileName);
    const raw = fs.readFileSync(filePath, "utf8");
    const fmEnd = raw.indexOf("\n---\n", 4);
    if (fmEnd === -1) continue;
    const body = raw.slice(fmEnd + 5);
    const next = stripBody(body);
    if (next !== body) {
      fs.writeFileSync(filePath, raw.slice(0, fmEnd + 5) + next);
      touched += 1;
    }
  }
}
console.log(`strip-code-exercises: updated ${touched} files`);
