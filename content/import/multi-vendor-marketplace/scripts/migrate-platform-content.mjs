#!/usr/bin/env node
/**
 * Migrate course content from markdown-file / learning-log-file workflow
 * to platform-hosted delivery (interactive gate footer, sidebar navigation).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSE_ROOT = path.resolve(__dirname, "..");

const CHAPTER_NAMES = {
  1: "Introduction",
  2: "Project skeleton",
  3: "Why MongoDB",
  4: "Config and database",
  5: "Data model and seed",
  6: "Authentication API",
  7: "Login and registration",
  8: "Authorization and isolation",
  9: "Vendor store API",
  10: "Open your shop",
  11: "Manage products API",
  12: "Vendor dashboard",
  13: "Product photos",
  14: "Browse catalogue API",
  15: "Shop the marketplace",
  16: "Cart API",
  17: "Your cart",
  18: "Checkout and orders",
  19: "Payment processing",
  20: "Track orders",
  21: "Cache and search",
  22: "Async jobs and queues",
  23: "Deploy",
  99: "Closing",
};

const MODULE_FOLDER_TO_CHAPTER = Object.fromEntries(
  Object.entries({
    "01-introduction": 1,
    "02-project-skeleton": 2,
    "03-why-mongodb": 3,
    "04-config-and-database": 4,
    "05-data-model-and-seed": 5,
    "06-authentication-api": 6,
    "07-login-and-registration": 7,
    "08-authorization-and-isolation": 8,
    "09-vendor-store-api": 9,
    "10-open-your-shop": 10,
    "11-manage-products-api": 11,
    "12-vendor-dashboard": 12,
    "13-product-photos": 13,
    "14-browse-catalogue-api": 14,
    "15-shop-the-marketplace": 15,
    "16-cart-api": 16,
    "17-your-cart": 17,
    "18-checkout-and-orders": 18,
    "19-payment-processing": 19,
    "20-track-orders": 20,
    "21-cache-and-search": 21,
    "22-async-jobs-and-queues": 22,
    "23-deploy": 23,
    "99-closing": 99,
  }).map(([folder, num]) => [folder, { num, name: CHAPTER_NAMES[num] }])
);

function walkMdFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "scripts") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMdFiles(full, files);
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function titleFromFilename(filename) {
  const base = path.basename(filename, ".md");
  const slug = base.replace(/^\d+\.\d+-/, "");
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function lessonLinkFromPath(filePath) {
  const match = filePath.match(/(\d{2}-[^/]+)\/(\d+\.\d+-[^`]+)\.md/);
  if (!match) return null;
  const [, folder, file] = match;
  const chapter = MODULE_FOLDER_TO_CHAPTER[folder];
  if (!chapter) return titleFromFilename(file);
  return `**${chapter.name}** — ${titleFromFilename(file)}`;
}

function replaceNavigation(text) {
  let out = text;

  // → Continue to **`path/file.md`**
  out = out.replace(
    /→\s*Continue to \*\*`([^`]+\.md)`\*\*/g,
    (_, p) => {
      const link = lessonLinkFromPath(p);
      const folderMatch = p.match(/^(\d{2}-[^/]+)\//);
      const chapter = folderMatch ? MODULE_FOLDER_TO_CHAPTER[folderMatch[1]] : null;
      if (chapter) {
        return `→ Mark this chapter complete in the platform, then continue to **${chapter.name}** (Chapter ${chapter.num})`;
      }
      return `→ Continue to **${titleFromFilename(p)}** in the sidebar`;
    }
  );

  // Continue to **`path/file.md`** (no arrow) — with or without folder prefix
  out = out.replace(
    /Continue to \*\*`([^`]+\.md)`\*\*/g,
    (_, p) => {
      const folderMatch = p.match(/^(\d{2}-[^/]+)\//);
      const chapter = folderMatch ? MODULE_FOLDER_TO_CHAPTER[folderMatch[1]] : null;
      if (chapter) {
        return `Continue to **${titleFromFilename(p)}** in the sidebar (Chapter ${chapter.num})`;
      }
      return `Continue to **${titleFromFilename(p)}** in the sidebar`;
    }
  );

  // After the gate → **`path/file.md`**
  out = out.replace(
    /After the gate → \*\*`([^`]+\.md)`\*\*/g,
    (_, p) => {
      const folderMatch = p.match(/^(\d{2}-[^/]+)\//);
      const chapter = folderMatch ? MODULE_FOLDER_TO_CHAPTER[folderMatch[1]] : null;
      if (chapter) {
        return `After the gate, continue to **${chapter.name}** (Chapter ${chapter.num}) in the sidebar`;
      }
      return `After the gate, continue in the sidebar`;
    }
  );

  // Clear **`chapter/checklist.md`** before opening
  out = out.replace(
    /Clear \*\*`([^`]+\.md)`\*\* before opening this (?:file|lesson)/gi,
    (_, p) => {
      const folderMatch = p.match(/^(\d{2}-[^/]+)\//);
      const chapter = folderMatch ? MODULE_FOLDER_TO_CHAPTER[folderMatch[1]] : null;
      if (chapter) {
        return `Clear the Chapter ${chapter.num} gate before opening this lesson`;
      }
      return "Clear the previous chapter gate before opening this lesson";
    }
  );

  // Gate complete → **`path`**
  out = out.replace(
    /Gate complete → \*\*`([^`]+\.md)`\*\*/g,
    (_, p) => {
      const folderMatch = p.match(/^(\d{2}-[^/]+)\//);
      const chapter = folderMatch ? MODULE_FOLDER_TO_CHAPTER[folderMatch[1]] : null;
      if (chapter) {
        return `Gate complete → continue to **${chapter.name}** (Chapter ${chapter.num}) in the sidebar`;
      }
      return `Gate complete → continue in the sidebar`;
    }
  );

  // Open `03.01-set-the-scene.md`
  out = out.replace(
    /Open `(\d{2}-[^/]+\/)?(\d+\.\d+-[^`]+\.md)`/g,
    (_, _folder, file) => `Open **${titleFromFilename(file)}** in the sidebar`
  );

  // **Next file:** `02.08-create-the-repo.md`
  out = out.replace(
    /\*\*Next file:\*\* `([^`]+\.md)`/g,
    (_, p) => `**Next lesson:** ${titleFromFilename(p)}`
  );

  // **Next step:** 2.8 — ...
  out = out.replace(/\*\*Next step:\*\* 2\.8 — `git init`/g, "**Next lesson:** Create the repo");

  return out;
}

function replaceLearningLogRefs(text) {
  let out = text;

  out = out.replace(
    /Learning log committed in \*\*`learning-log\/[^`]+\.md`\*\*/gi,
    "Learning log answers written on the platform"
  );
  out = out.replace(
    /Learning log: \*\*`learning-log\/[^`]+\.md`\*\*/gi,
    "Learning log answers on the platform"
  );
  out = out.replace(
    /Every learning log question answered in your own words in `learning-log\/[^`]+\.md` and committed\./g,
    "Every learning log question answered in your own words using the fields at the bottom of this page."
  );
  out = out.replace(
    /Create or update \*\*`learning-log\/[^`]+\.md`\*\*\.[^\n]*/g,
    "Answer the learning log questions in the fields at the bottom of this page."
  );
  out = out.replace(
    /Create \*\*`learning-log\/[^`]+\.md`\*\*\.[^\n]*/g,
    "Answer the learning log questions in the fields at the bottom of this page."
  );
  out = out.replace(
    /\*\*`learning-log\/[^`]+\.md`\*\* — complete sentences\./g,
    "Answer in complete sentences in the platform learning log fields below."
  );
  out = out.replace(
    /You may have written `learning-log\/01-introduction\.md`/g,
    "You should have completed the Chapter 1 gate and learning log on the platform"
  );
  out = out.replace(
    /A `learning-log\/01-introduction\.md` \(hopefully committed\)/g,
    "Chapter 1 gate cleared on the platform"
  );
  out = out.replace(
    /In `learning-log\/02-project-skeleton\.md` you may add a short "Readings" subsection[^\n]*/g,
    "You may note your readings in the Chapter 2 learning log on the platform — optional until the gate."
  );
  out = out.replace(
    /Copy this into your learning log if helpful:/g,
    "Optional confirmation statement (you can paste this into a learning log field):"
  );
  out = out.replace(
    /Copy into learning log if helpful:/g,
    "Optional confirmation statement:"
  );
  out = out.replace(
    /paste in portfolio and `learning-log\/23-deploy\.md`/g,
    "paste in your portfolio and Chapter 23 learning log on the platform"
  );
  out = out.replace(
    /Learning log in \*\*`learning-log\/[^`]+\.md`\*\*/gi,
    "Learning log answers on the platform"
  );
  out = out.replace(
    /Write answers in \*\*`learning-log\/[^`]+\.md`\*\*[^\n]*/g,
    "Write answers in the chapter learning log on the platform"
  );
  out = out.replace(
    /Update `learning-log\/[^`]+\.md`[^\n]*/g,
    "Update your learning log answers on the platform"
  );
  out = out.replace(
    /`learning-log\/` established[^\n]*/g,
    "platform learning log habit established"
  );
  out = out.replace(
    /- \[ \] `learning-log\/` contains completed files[^\n]*/g,
    "- [ ] Chapter gates completed on the platform"
  );
  out = out.replace(
    /\*\*Repository & habits:\*\* Git initialized; `\.gitignore` protects secrets; `learning-log\/` established[^\n]*/g,
    "**Repository & habits:** Git initialized; `.gitignore` protects secrets; Chapter 1 gate cleared on the platform"
  );
  out = out.replace(
    /Tree preview: `server\/` \+ `client\/` \+ `learning-log\/`/g,
    "Tree preview: `server/` + `client/` + `docs/`"
  );
  out = out.replace(
    /\| 2\.8 \| Root repo, `\.gitignore`, `README`, `learning-log\/` \|/g,
    "| 2.8 | Root repo, `.gitignore`, `README` |"
  );
  out = out.replace(
    /\| `learning-log\/` exists \| yes \|/g,
    ""
  );
  out = out.replace(
    /\| Chapter 3 \| `learning-log\/03-why-mongodb\.md` committed \|/g,
    "| Chapter 3 | Chapter 3 gate cleared on the platform |"
  );
  out = out.replace(
    /git add learning-log\/[^\n]+\n/g,
    ""
  );

  // Remove git add learning-log blocks
  out = out.replace(
    /### Commit\n\n```bash\ngit add learning-log\/[^\n]+\n(?:git add [^\n]+\n)?git commit[^\n]+\n```\n\n?/g,
    ""
  );
  out = out.replace(
    /Commit the learning log:\n\n```bash\ngit add learning-log\/[^\n]+\n(?:git add [^\n]+\n)?git commit[^\n]+\n```\n\n?/g,
    ""
  );
  out = out.replace(
    /```bash\ngit add learning-log\/[^\n]+\n(?:git add [^\n]+\n)?git commit[^\n]+\n```\n\n?/g,
    ""
  );
  out = out.replace(
    /```bash\ngit add learning-log\/[^\n]+\n```\n\n?/g,
    ""
  );

  // Remove learning-log from repo trees in prose
  out = out.replace(/\|\s*`learning-log\/[^\|]+\`\s*\|\s*[^\n]+\|\n/g, "");
  out = out.replace(/├── learning-log\/\n/g, "");
  out = out.replace(/- `learning-log\/` — chapter notes[^\n]*\n/g, "");
  out = out.replace(
    /- \[ \] `learning-log\/` exists with `01-introduction\.md` and `02-project-skeleton\.md`\n/g,
    ""
  );
  out = out.replace(
    /Ensure `learning-log\/01-introduction\.md` exists[^\n]*\n/g,
    ""
  );
  out = out.replace(
    /You'll add `learning-log\/02-project-skeleton\.md` at the chapter gate \(2\.19\)\.\n/g,
    ""
  );
  out = out.replace(
    /Initialize Git, add a root `\.gitignore`, stub `README\.md`, and create `learning-log\/` with your Chapter 1 answers \(or add them now if missing\)\./g,
    "Initialize Git, add a root `.gitignore`, and stub `README.md`."
  );
  out = out.replace(
    /Create a \*\*new directory\*\* for your marketplace application — \*\*not\*\* inside the course guides folder\. Initialize Git, add a root `\.gitignore`, stub `README\.md`, and create `learning-log\/`/g,
    "Create a **new directory** for your marketplace application — **not** inside the course guides folder. Initialize Git, add a root `.gitignore`, stub `README.md`"
  );
  out = out.replace(
    /- \[ \] \*\*Learning log committed\*\*[^\n]*\n/g,
    "- [ ] **Learning log answers** written on the platform\n"
  );

  return out;
}

function inferFrontmatter(filePath, body) {
  const rel = filePath.replace(COURSE_ROOT + path.sep, "");
  const match = rel.match(/(\d+)-[^/]+\/(\d+)\.(\d+)-(.+)\.md$/);
  if (!match) return null;
  const moduleNum = Number(match[1]);
  const lessonNum = Number(match[3]);
  const slug = match[4];
  const titleMatch = body.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/^"/, "").replace(/"$/, "") : slug;
  const chapterName = CHAPTER_NAMES[moduleNum] ?? `Chapter ${moduleNum}`;
  const id = `multi-vendor-marketplace-${String(moduleNum).padStart(2, "0")}-${String(lessonNum).padStart(2, "0")}`;
  return [
    `id: ${id}`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    `module: ${moduleNum}`,
    `lesson: ${lessonNum}`,
    `stepType: Gate`,
    `phase: "Module ${moduleNum}"`,
    `summary: "Gate for Chapter ${moduleNum} — ${chapterName}. Tick every box and answer the learning log on this page before continuing."`,
    `estimatedMinutes: 20`,
    `prerequisites: []`,
    `resources: []`,
    `media: []`,
  ].join("\n");
}

function parseFrontmatter(content, filePath) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) return { frontmatter: match[1], body: match[2] };
  const inferred = inferFrontmatter(filePath, content);
  if (inferred) return { frontmatter: inferred, body: content };
  return { frontmatter: "", body: content };
}

function updateFrontmatterSummary(frontmatter, moduleNum) {
  const chapterName = moduleNum ? CHAPTER_NAMES[moduleNum] : null;
  if (/learning-log\//i.test(frontmatter) || /Learning log/i.test(frontmatter)) {
    if (moduleNum && chapterName) {
      return frontmatter.replace(
        /^summary:.*$/m,
        `summary: "Gate for Chapter ${moduleNum} — ${chapterName}. Tick every box and answer the learning log on this page before continuing."`
      );
    }
  }
  return frontmatter
    .replace(/Learning log committed in \*\*`learning-log\/[^`]+`\*\*/gi, "Complete the gate on this page")
    .replace(/Learning log: \*\*`learning-log\/[^`]+`\*\*/gi, "Complete the gate on this page")
    .replace(/learning-log\/[^`"]+\.md/gi, "the platform learning log");
}

function extractChecklistSections(body) {
  const items = [];
  const lines = body.split("\n");
  let inChecklistRegion = false;
  let currentSection = "Checklist";
  let pastGateHeading = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^##\s+Chapter\s+\d+.*checklist.*gate/i.test(trimmed)) {
      inChecklistRegion = true;
      pastGateHeading = true;
      continue;
    }

    if (
      /^##\s+(Definition of Done|Key takeaways|Repository artifacts)/i.test(trimmed) ||
      /^##\s+Understanding/i.test(trimmed)
    ) {
      inChecklistRegion = true;
      continue;
    }

    if (inChecklistRegion && /^##\s+All boxes ticked/i.test(trimmed)) {
      break;
    }

    if (inChecklistRegion && /^##\s+Learning log/i.test(trimmed)) {
      break;
    }

    if (pastGateHeading && trimmed.startsWith("## ") && !trimmed.startsWith("###")) {
      break;
    }

    if (inChecklistRegion && trimmed.startsWith("### ") && !/^###\s+Learning log/i.test(trimmed)) {
      currentSection = trimmed.replace(/^###\s+/, "");
      continue;
    }

    if (inChecklistRegion && /^-\s+\[\s*\]\s+/.test(trimmed)) {
      items.push({ section: currentSection, label: trimmed.replace(/^-\s+\[\s*\]\s+/, "") });
    }
  }

  return items;
}

function extractLearningLogQuestions(body) {
  const questions = [];
  const lines = body.split("\n");
  let inLearningLog = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##\s+Chapter\s+\d+.*checklist.*gate/i.test(trimmed)) {
      inLearningLog = false;
      continue;
    }
    if (/^###\s+Learning log/i.test(trimmed)) {
      inLearningLog = true;
      continue;
    }
    if (/^##\s+Learning log/i.test(trimmed)) {
      inLearningLog = true;
      continue;
    }
    if (inLearningLog && trimmed.startsWith("## ") && !trimmed.startsWith("###")) {
      break;
    }
    const match = /^\d+\.\s+\*\*(.+?)\*\*\s*(.*)$/.exec(trimmed);
    if (match && inLearningLog) {
      const rest = match[2]?.trim() ?? "";
      questions.push(rest ? `**${match[1]}** ${rest}` : `**${match[1]}**`);
    }
  }

  return questions;
}

function extractTailSections(body) {
  const tailStart = body.search(/^##\s+(Gate rule|Troubleshooting|Phase progress|Optional|Celebration|What Chapter|Final gate|Document version|After the gate)/m);
  if (tailStart === -1) return "";
  return body.slice(tailStart).trim();
}

function transformGateFile(filePath, content) {
  const { frontmatter, body } = parseFrontmatter(content, filePath);
  const moduleMatch = frontmatter.match(/^module:\s*(\d+)/m);
  const moduleNum = moduleMatch ? Number(moduleMatch[1]) : null;
  if (!moduleNum || !CHAPTER_NAMES[moduleNum]) return null;

  const alreadyMigrated =
    /##\s+Chapter\s+\d+.*checklist.*gate/i.test(body) &&
    !/##\s+Definition of Done/i.test(body) &&
    !/##\s+Learning log — mandatory/i.test(body);

  if (alreadyMigrated) {
    const checklistItems = extractChecklistSections(body);
    if (checklistItems.length === 0) return null;
    const newFrontmatter = updateFrontmatterSummary(frontmatter, moduleNum);
    return `---\n${newFrontmatter}\n---\n${replaceNavigation(replaceLearningLogRefs(body))}`;
  }

  const chapterName = CHAPTER_NAMES[moduleNum];
  const nextChapter = CHAPTER_NAMES[moduleNum + 1];
  const checklistItems = extractChecklistSections(body);
  const questions = extractLearningLogQuestions(body);
  const tail = extractTailSections(body);

  // Keep title line and gate blockquote from original
  const titleMatch = body.match(/^# .+\n\n> \*\*\[Gate\]\*\*[^\n]+\n\n[^\n]+\n\n/);
  const intro = titleMatch
    ? titleMatch[0]
        .replace(/Learning log committed[^\n]+/gi, "Answer the learning log on this page before continuing.")
        .replace(/Learning log:[^\n]+/gi, "Answer the learning log on this page before continuing.")
    : `# Gate\n\n> **[Gate]** · Chapter ${String(moduleNum).padStart(2, "0")} — ${chapterName}\n\nThis is the **gate** for Chapter ${moduleNum}. Tick every box honestly and answer the learning log below before opening Chapter ${moduleNum + 1}.\n\n`;

  let grouped = "";
  let lastSection = null;
  for (const item of checklistItems) {
    if (item.section !== lastSection) {
      grouped += `\n### ${item.section}\n\n`;
      lastSection = item.section;
    }
    grouped += `- [ ] ${item.label}\n`;
  }

  let learningLog = "";
  if (questions.length > 0) {
    learningLog = `\n### Learning log — write now\n\nAnswer **in your own words** in the fields below:\n\n`;
    questions.forEach((q, i) => {
      learningLog += `${i + 1}. ${q}\n\n`;
    });
  }

  const gateClose = nextChapter
    ? `\n## All boxes ticked?\n\nMark this chapter complete in the platform, then continue to **${nextChapter}** (Chapter ${moduleNum + 1}).\n\n`
    : `\n## All boxes ticked?\n\nMark this chapter complete in the platform.\n\n`;

  let newBody = intro;
  newBody += `## Chapter ${moduleNum} — ${chapterName} checklist (gate)\n\n`;
  newBody += `Do **not** open Chapter ${moduleNum + 1} until every box is ticked and learning log answers are written below.\n`;
  newBody += grouped;
  newBody += learningLog;
  newBody += gateClose;

  if (tail) {
    const cleanedTail = replaceNavigation(replaceLearningLogRefs(tail))
      .replace(/^## Gate rule[\s\S]*?(?=^## )/m, "")
      .replace(/\*\*All boxes ticked\?\*\*[^\n]*\n/g, "")
      .replace(/^\*\*All boxes ticked\?\*\*[^\n]*\n/gm, "");
    newBody += cleanedTail + "\n";
  }

  const newFrontmatter = updateFrontmatterSummary(frontmatter, moduleNum);
  return `---\n${newFrontmatter}\n---\n${replaceNavigation(replaceLearningLogRefs(newBody))}`;
}

function transformGeneralFile(content) {
  let out = content;
  out = replaceNavigation(out);
  out = replaceLearningLogRefs(out);
  return out;
}

function isGateFile(filePath, content) {
  if (filePath.includes("checklist.md")) return true;
  if (/stepType: Gate/.test(content) && content.includes("- [ ]")) return true;
  return false;
}

function main() {
  const files = walkMdFiles(COURSE_ROOT);
  let gateCount = 0;
  let generalCount = 0;

  for (const file of files) {
    if (file.endsWith("COURSE-OUTLINE.md")) continue;
    const original = fs.readFileSync(file, "utf8");
    let updated;

    if (isGateFile(file, original)) {
      updated = transformGateFile(file, original) ?? transformGeneralFile(original);
      if (transformGateFile(file, original)) gateCount += 1;
    } else {
      updated = transformGeneralFile(original);
      generalCount += 1;
    }

    if (updated !== original) {
      fs.writeFileSync(file, updated, "utf8");
    }
  }

  console.log(`Updated gate files: ${gateCount}`);
  console.log(`Updated general files: ${generalCount}`);
  console.log(`Total scanned: ${files.length}`);
}

main();
