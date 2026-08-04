/**
 * Imports content/import/multi-vendor-marketplace/ into the real Course /
 * Module / Chapter / Block tables.
 *
 * This is a *structural* import, not a rewrite (see the chat decision this
 * script implements): the mentor's prose is kept close to verbatim. The two
 * things it actively transforms are:
 *
 *   1. ```quiz``` fenced blocks (js-yaml-parsed) -> real <Quiz>/<OpenQuestion>
 *      blocks, with the correct answer moved into Block.config (server-only)
 *      and only a placeholder tag left in the MDX body.
 *   2. The 16 chapters whose quiz slot was left as "Reserved — excluded from
 *      this course pass" (see e.g. 04-config-and-database/04.07-quiz.md) had
 *      a ready "Mini self-check" question list sitting in plain prose. Those
 *      get turned into real (optional, ungraded) OpenQuestion blocks instead
 *      of staying inert text — the concrete "add missing things" this pass
 *      does, without inventing new content.
 *
 * Idempotent: re-running upserts Modules/Chapters by (courseId, order) /
 * (courseId, slug) and replaces each chapter's Block rows from scratch. Safe
 * before there are any real learner Responses against this course; once
 * mentees start answering, block replacement needs the "keep vs invalidate"
 * flow from docs/02-content-authoring.mdx instead.
 *
 * Run: pnpm content:import
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { ulid } from "ulid";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { SEED_COURSE, SEED_USERS } from "../src/lib/seed-data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSE_SOURCE_DIR = path.resolve(__dirname, "../content/import/multi-vendor-marketplace");
const COURSE_OUTPUT_DIR = path.resolve(__dirname, "../content/transformed/multi-vendor-marketplace");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CHAPTER_NAMES: Record<number, string> = {
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

type PendingBlock = {
  id: string;
  type: "QUIZ" | "OPEN_QUESTION";
  config: Prisma.InputJsonValue;
  required: boolean;
};

type ParsedLesson = {
  moduleNum: number;
  lessonNum: number;
  slugPart: string;
  title: string;
  summary: string | null;
  source: string;
  blocks: PendingBlock[];
  isMilestone: boolean;
};

function readModuleDirs(): { dirName: string; moduleNum: number }[] {
  return fs
    .readdirSync(COURSE_SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+-/.test(entry.name))
    .map((entry) => ({ dirName: entry.name, moduleNum: Number(entry.name.match(/^(\d+)-/)![1]) }))
    .sort((a, b) => a.moduleNum - b.moduleNum);
}

function readLessonFiles(moduleDir: string): { fileName: string; lessonNum: number; slugPart: string }[] {
  return fs
    .readdirSync(path.join(COURSE_SOURCE_DIR, moduleDir))
    .filter((name) => /^\d+\.\d+-.+\.md$/.test(name))
    .map((name) => {
      const match = name.match(/^\d+\.(\d+)-(.+)\.md$/)!;
      return { fileName: name, lessonNum: Number(match[1]), slugPart: match[2] };
    })
    .sort((a, b) => a.lessonNum - b.lessonNum);
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };
  const frontmatter = (yaml.load(match[1]) as Record<string, unknown>) ?? {};
  return { frontmatter, body: match[2] };
}

function cleanTitle(rawTitle: string | undefined, fallback: string): string {
  if (!rawTitle) return fallback;
  return rawTitle.replace(/^\d+\.\d+\s+—\s+/, "").trim() || fallback;
}

/** Removes the internal step-type banner — mentees don't need `[Learn] · Chapter …`. */
function stripStepTypeBlockquote(body: string): string {
  return body.replace(/^> \*\*\[(?:Read|Learn|Build|Gate|Check|Wrap)\]\*\*[^\n]*\n\n?/m, "");
}

/** Title is shown in the reader chrome — drop the duplicate `# 6.6 — …` heading. */
function stripLeadingH1(body: string): string {
  return body.replace(/^# \d+\.\d+ — [^\n]+\n\n?/, "");
}

/** `use `<Outlet />` here` → `use '<Outlet />' here` — only when the inner span is JSX. */
function fixJsxInInlineCode(prose: string): string {
  return prose.replace(/`([^`\n]*)`(<[^`\n]+>)`([^`\n]*)/g, (_m, a, b, c) => `\`${a}'${b}'${c}\``);
}

function escapeMdxInline(text: string): string {
  return text.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;").replace(/</g, "&lt;");
}

/**
 * MDX treats bare `{` and `<letter` outside of code as JS expressions / JSX.
 * Escape with HTML entities in prose only — fenced code blocks, inline code,
 * and custom MDX blocks are left verbatim.
 */
function escapeMdxProse(body: string): string {
  const blockTags: string[] = [];
  let withMarkers = body.replace(/<FaqGroup>[\s\S]*?<\/FaqGroup>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  withMarkers = withMarkers.replace(/<(Quiz|OpenQuestion)\s+id="[^"]+"\s*\/>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });

  const escaped = splitOutsideFences(withMarkers, /```[\s\S]*?```/g, (segment) => {
    const fixed = fixJsxInInlineCode(segment);
    return splitOutsideFences(fixed, /`[^`\n]+`/g, (prose) =>
      prose.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;").replace(/</g, "&lt;")
    );
  });

  return escaped.replace(/\x00BLOCK(\d+)\x00/g, (_, index) => blockTags[Number(index)]!);
}

/** Replace vague `https://...` placeholders with concrete example domains. */
function normalizePlaceholderUrls(body: string): string {
  const fix = (text: string) =>
    text
      .replace(/https:\/\/api\.\.\./g, "https://api.yourdomain.com")
      .replace(/https:\/\/app\.\.\./g, "https://app.yourdomain.com")
      .replace(/https:\/\/\.\.\./g, "https://your-domain.com");

  return splitOutsideFences(body, /```[\s\S]*?```/g, fix);
}

type FaqPair = { question: string; answer: string };

function parseFaqPairs(section: string): FaqPair[] {
  const items: FaqPair[] = [];
  const blocks = section.trim().split(/\n\n+/);

  for (const block of blocks) {
    const match = block.match(/^\*\*Q:\s*(.+?)\*\*\s*\nA:\s*([\s\S]+)$/);
    if (match) {
      items.push({ question: match[1]!.trim(), answer: match[2]!.trim() });
    }
  }
  return items;
}

/** Turn prose Q/A lists into structured FaqGroup MDX for readable callouts. */
function transformFaqSections(body: string): string {
  return body.replace(
    /(?:^|\n)## Common beginner questions\n\n([\s\S]*?)(?=\n## |\s*$)/g,
    (full, section: string) => {
      const pairs = parseFaqPairs(section);
      if (pairs.length === 0) return full;

      const items = pairs
        .map(
          ({ question, answer }) =>
            `<FaqItem question=${JSON.stringify(question)}>\n\n${escapeMdxInline(answer)}\n\n</FaqItem>`
        )
        .join("\n\n");

      const prefix = full.startsWith("\n") ? "\n" : "";
      return `${prefix}## Common beginner questions\n\n<FaqGroup>\n\n${items}\n\n</FaqGroup>\n\n`;
    }
  );
}

/** Runs `transform` over the parts of `text` that do NOT match `pattern`, leaving matches untouched. */
function splitOutsideFences(text: string, pattern: RegExp, transform: (part: string) => string): string {
  const parts = text.split(pattern);
  const matches = text.match(pattern) ?? [];
  return parts.map((part, i) => (i < parts.length - 1 ? transform(part) + matches[i] : transform(part))).join("");
}

/** ```quiz``` fenced YAML -> real Quiz/OpenQuestion blocks + placeholder tags. */
function transformQuizFences(body: string, pushBlock: (b: PendingBlock) => string): string {
  return body.replace(/```quiz\n([\s\S]*?)```/g, (_match, yamlText: string) => {
    const parsed = yaml.load(yamlText) as {
      type: "mcq" | "short";
      question: string;
      options?: string[];
      correct?: number;
      modelAnswer?: string;
    };

    if (parsed.type === "mcq" && parsed.options && typeof parsed.correct === "number") {
      const options = parsed.options.map((label, i) => ({ id: `opt-${i}`, label }));
      const id = ulid();
      const placeholder = pushBlock({
        id,
        type: "QUIZ",
        required: true,
        config: {
          quizType: "single",
          prompt: parsed.question,
          options,
          correctOptionIds: [`opt-${parsed.correct}`],
          allowRetry: true,
        },
      });
      return placeholder;
    }

    const id = ulid();
    return pushBlock({
      id,
      type: "OPEN_QUESTION",
      required: true,
      config: { prompt: parsed.question, minWords: 0, sampleAnswer: parsed.modelAnswer },
    });
  });
}

/**
 * The 16 "Reserved — excluded from this course pass" quiz stubs each still
 * have a "## Mini self-check (optional...)" numbered question list sitting
 * as inert prose. Turn those into real, optional OpenQuestion blocks instead
 * of leaving genuinely useful review questions unused.
 */
function transformMiniSelfCheck(body: string, pushBlock: (b: PendingBlock) => string): string {
  const lines = body.split("\n");
  const out: string[] = [];
  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^##\s+Mini self-check/i.test(trimmed)) {
      inSection = true;
      out.push(line);
      continue;
    }
    if (inSection && /^##\s+/.test(trimmed)) {
      inSection = false;
    }

    if (inSection && /^\d+\.\s+.+/.test(trimmed)) {
      const questions: string[] = [];
      while (i < lines.length && /^\d+\.\s+.+/.test(lines[i].trim())) {
        questions.push(lines[i].trim().replace(/^\d+\.\s+/, "").replace(/\s{2,}$/, ""));
        i++;
      }
      i--;
      for (const question of questions) {
        const id = ulid();
        out.push(
          pushBlock({
            id,
            type: "OPEN_QUESTION",
            required: false,
            config: { prompt: question, minWords: 0 },
          })
        );
        out.push("");
      }
      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}

/** `## Reflect` prose questions become optional OpenQuestion blocks. */
function transformReflectSection(body: string, pushBlock: (b: PendingBlock) => string): string {
  return body.replace(/^## Reflect\n\n([\s\S]*?)(?=\n## |\s*$)/m, (_match, content) => {
    const prompt = content
      .trim()
      .split("\n")
      .map((line: string) => line.trim())
      .find(Boolean);
    if (!prompt) return "## Reflect\n\n";
    const block = pushBlock({
      id: ulid(),
      type: "OPEN_QUESTION",
      required: false,
      config: { prompt, minWords: 10 },
    });
    return `## Reflect\n\n${block}\n\n`;
  });
}

/** Lessons with no quiz/self-check get a lightweight "before you continue" checkpoint. */
function addLessonCheckpoint(body: string, pushBlock: (b: PendingBlock) => string): string {
  const block = pushBlock({
    id: ulid(),
    type: "OPEN_QUESTION",
    required: false,
    config: {
      prompt:
        "Before moving on: in 2–3 sentences, what was the main takeaway from this lesson?",
      minWords: 15,
    },
  });
  const section = `\n## Before you continue\n\n${block}\n`;
  if (/^## Next/m.test(body)) {
    return body.replace(/^## Next/m, `${section}\n## Next`);
  }
  return `${body.trimEnd()}${section}\n`;
}

function parseLesson(moduleNum: number, moduleDir: string, fileName: string, lessonNum: number, slugPart: string): ParsedLesson {
  const raw = fs.readFileSync(path.join(COURSE_SOURCE_DIR, moduleDir, fileName), "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);

  const blocks: PendingBlock[] = [];
  const pushBlock = (block: PendingBlock) => {
    blocks.push(block);
    return `<${block.type === "QUIZ" ? "Quiz" : "OpenQuestion"} id="${block.id}" />`;
  };

  let source = stripStepTypeBlockquote(body);
  source = stripLeadingH1(source);
  source = normalizePlaceholderUrls(source);
  source = transformQuizFences(source, pushBlock);
  source = transformMiniSelfCheck(source, pushBlock);
  source = transformReflectSection(source, pushBlock);
  source = transformFaqSections(source);
  const isMilestone = /-checklist\.md$/.test(fileName);
  if (blocks.length === 0 && !isMilestone) {
    source = addLessonCheckpoint(source, pushBlock);
  }
  source = escapeMdxProse(source);

  const fallbackTitle = slugPart
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    moduleNum,
    lessonNum,
    slugPart,
    title: cleanTitle(frontmatter.title as string | undefined, fallbackTitle),
    summary: (frontmatter.summary as string | undefined)?.trim() || null,
    source: source.trim() + "\n",
    blocks,
    isMilestone,
  };
}

async function upsertCourse() {
  const mentor = await prisma.user.findFirst({ where: { role: "MENTOR" } });
  if (!mentor) {
    throw new Error(
      `No MENTOR user found — run "pnpm db:seed" first (creates ${SEED_USERS.find((u) => u.role === "MENTOR")?.email}).`
    );
  }

  return prisma.course.upsert({
    where: { slug: SEED_COURSE.slug },
    update: {
      title: SEED_COURSE.title,
      description: SEED_COURSE.description,
      projectGoal: SEED_COURSE.projectGoal,
      difficulty: SEED_COURSE.difficulty,
      estimatedHours: SEED_COURSE.estimatedHours,
      coverUrl: SEED_COURSE.coverUrl,
    },
    create: {
      slug: SEED_COURSE.slug,
      title: SEED_COURSE.title,
      description: SEED_COURSE.description,
      projectGoal: SEED_COURSE.projectGoal,
      difficulty: SEED_COURSE.difficulty,
      estimatedHours: SEED_COURSE.estimatedHours,
      coverUrl: SEED_COURSE.coverUrl,
      status: "PUBLISHED",
      mentorId: mentor.id,
      publishedAt: new Date(),
    },
  });
}

async function main() {
  const course = await upsertCourse();
  fs.rmSync(COURSE_OUTPUT_DIR, { recursive: true, force: true });

  let moduleCount = 0;
  let chapterCount = 0;
  let blockCount = 0;

  const moduleDirs = readModuleDirs();
  const importedModuleOrders: number[] = [];
  const importedChapterSlugs: string[] = [];

  for (let index = 0; index < moduleDirs.length; index++) {
    const { dirName, moduleNum } = moduleDirs[index]!;
    const displayOrder = index + 1;
    importedModuleOrders.push(displayOrder);

    const title = CHAPTER_NAMES[moduleNum] ?? `Module ${displayOrder}`;
    const mod = await prisma.module.upsert({
      where: { courseId_order: { courseId: course.id, order: displayOrder } },
      update: { title },
      create: { courseId: course.id, order: displayOrder, title },
    });
    moduleCount += 1;

    const outputModuleDir = path.join(COURSE_OUTPUT_DIR, dirName);
    fs.mkdirSync(outputModuleDir, { recursive: true });

    for (const { fileName, lessonNum, slugPart } of readLessonFiles(dirName)) {
      const lesson = parseLesson(moduleNum, dirName, fileName, lessonNum, slugPart);
      const slug = `${displayOrder}-${lessonNum}-${slugPart}`;
      importedChapterSlugs.push(slug);

      const chapter = await prisma.chapter.upsert({
        where: { courseId_slug: { courseId: course.id, slug } },
        update: {
          moduleId: mod.id,
          title: lesson.title,
          summary: lesson.summary,
          order: lessonNum,
          source: lesson.source,
          compiled: lesson.source,
          isMilestone: lesson.isMilestone,
          publishedAt: new Date(),
        },
        create: {
          courseId: course.id,
          moduleId: mod.id,
          slug,
          title: lesson.title,
          summary: lesson.summary,
          order: lessonNum,
          source: lesson.source,
          compiled: lesson.source,
          isMilestone: lesson.isMilestone,
          publishedAt: new Date(),
        },
      });
      chapterCount += 1;

      await prisma.block.deleteMany({ where: { chapterId: chapter.id } });
      if (lesson.blocks.length > 0) {
        await prisma.block.createMany({
          data: lesson.blocks.map((block, index) => ({
            id: block.id,
            chapterId: chapter.id,
            type: block.type,
            order: index + 1,
            required: block.required,
            blocking: false,
            points: 1,
            config: block.config,
            tags: [],
          })),
        });
        blockCount += lesson.blocks.length;
      }

      const frontmatter = [
        `title: ${JSON.stringify(lesson.title)}`,
        `module: ${displayOrder}`,
        `lesson: ${lessonNum}`,
        lesson.summary ? `summary: ${JSON.stringify(lesson.summary)}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      fs.writeFileSync(
        path.join(outputModuleDir, fileName.replace(/\.md$/, ".mdx")),
        `---\n${frontmatter}\n---\n${lesson.source}`,
        "utf8"
      );
    }
  }

  await prisma.chapter.deleteMany({
    where: { courseId: course.id, slug: { notIn: importedChapterSlugs } },
  });
  await prisma.module.deleteMany({
    where: { courseId: course.id, order: { notIn: importedModuleOrders } },
  });

  console.log(`Course:   ${course.title} (${course.slug})`);
  console.log(`Modules:  ${moduleCount}`);
  console.log(`Chapters: ${chapterCount}`);
  console.log(`Blocks:   ${blockCount}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
