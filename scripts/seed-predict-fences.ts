/**
 * Adds a lightweight ```predict``` fence to prime-your-thinking lessons that lack one.
 * Run: pnpm content:seed-predicts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readLessonFiles, readModuleDirs } from "./import-course";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../content/import/multi-vendor-marketplace");

const PREDICT_BLOCK = `
\`\`\`predict
prompt: "Before you build — what is the single riskiest assumption in this module?"
options:
  - id: a
    label: "Database choice or schema shape"
  - id: b
    label: "Auth/session handling"
  - id: c
    label: "Frontend state vs API contract"
  - id: d
    label: "Deployment or env configuration"
correctOptionId: a
explanation: "There is often more than one good answer — the point is to name *one* assumption you will validate in the upcoming lessons."
allowRetry: true
\`\`\`
`;

let touched = 0;
for (const { dirName } of readModuleDirs()) {
  for (const { fileName } of readLessonFiles(dirName)) {
    if (!fileName.includes("prime-your-thinking")) continue;
    const filePath = path.join(ROOT, dirName, fileName);
    const raw = fs.readFileSync(filePath, "utf8");
    if (raw.includes("```predict")) continue;
    const insertAt = raw.search(/\n## /);
    if (insertAt === -1) continue;
    const next = `${raw.slice(0, insertAt)}\n${PREDICT_BLOCK}\n${raw.slice(insertAt)}`;
    fs.writeFileSync(filePath, next);
    touched += 1;
  }
}
console.log(`seed-predict-fences: added predict block to ${touched} files`);
