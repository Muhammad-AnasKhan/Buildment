/**
 * Imports content/import/multi-vendor-marketplace/ into the real Course /
 * Module / Chapter / Block tables.
 *
 * This is a *structural* import, not a rewrite (see the chat decision this
 * script implements): the mentor's prose is kept close to verbatim. The two
 * things it actively transforms are:
 *
 *   1. Explicit interactive fences (`quiz`, `openquestion`, `predict`) become
 *      registered blocks, with grading-only config kept server-side.
 *   2. Explicit presentation components such as ChapterRecap and ProjectPreview
 *      become registered presentation blocks.
 *
 * The importer never invents learner interactions. A reflection, quiz, or
 * mentor-reviewed answer must be authored intentionally in the source lesson.
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
import { load as loadYaml } from "js-yaml";
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
  24: "Inventory reservations",
  25: "Promotions & pricing",
  99: "Closing",
};

type PendingBlock = {
  id: string;
  type: "QUIZ" | "OPEN_QUESTION" | "CHAPTER_RECAP" | "PROJECT_PREVIEW" | "PREDICT";
  config: Prisma.InputJsonValue;
  required: boolean;
};

function blockPlaceholderTag(block: PendingBlock): string {
  const tag =
    block.type === "QUIZ"
      ? "Quiz"
      : block.type === "CHAPTER_RECAP"
          ? "ChapterRecap"
          : block.type === "PROJECT_PREVIEW"
            ? "ProjectPreview"
            : block.type === "PREDICT"
              ? "Predict"
              : "OpenQuestion";
  return `<${tag} id="${block.id}" />`;
}

function parseJsxStringAttr(source: string, attr: string): string | undefined {
  const match = source.match(new RegExp(`${attr}="([^"]*)"`));
  return match?.[1];
}

function parseJsxStringArray(source: string, attr: string): string[] | undefined {
  const match = source.match(new RegExp(`${attr}=\\{\\[([\\s\\S]*?)\\]\\}`));
  if (!match?.[1]) return undefined;
  const items: string[] = [];
  const re = /"((?:\\.|[^"\\])*)"/g;
  let item: RegExpExecArray | null;
  while ((item = re.exec(match[1])) !== null) {
    items.push(item[1]!.replace(/\\"/g, '"'));
  }
  return items.length > 0 ? items : undefined;
}

/** Inline `<ChapterRecap>` / `<ProjectPreview>` JSX -> registered blocks with id placeholders. */
function transformPresentationBlocks(body: string, pushBlock: (b: PendingBlock) => string): string {
  return body.replace(/<(ChapterRecap|ProjectPreview)([\s\S]*?)\/>/g, (full, tagName: string, attrs: string) => {
    if (/\bid=/.test(attrs)) return full;

    const pseudo = `<X${attrs}/>`;

    if (tagName === "ChapterRecap") {
      const points = parseJsxStringArray(pseudo, "points");
      if (!points?.length) return full;
      return pushBlock({
        id: ulid(),
        type: "CHAPTER_RECAP",
        required: false,
        config: { points },
      });
    }

    const title = parseJsxStringAttr(pseudo, "title");
    const description = parseJsxStringAttr(pseudo, "description");
    const features = parseJsxStringArray(pseudo, "features");
    const techStack = parseJsxStringArray(pseudo, "techStack");
    const imageUrl = parseJsxStringAttr(pseudo, "imageUrl");
    if (!title || !description || !features?.length) return full;

    const config: Record<string, unknown> = { title, description, features };
    if (techStack?.length) config.techStack = techStack;
    if (imageUrl) config.imageUrl = imageUrl;

    return pushBlock({
      id: ulid(),
      type: "PROJECT_PREVIEW",
      required: false,
      config: config as Prisma.InputJsonValue,
    });
  });
}

type ParsedLesson = {
  moduleNum: number;
  lessonNum: number;
  slugPart: string;
  title: string;
  summary: string | null;
  estimatedMinutes: number | null;
  readerMode: "DEFAULT" | "QUIZ";
  source: string;
  blocks: PendingBlock[];
  isMilestone: boolean;
};

export function readModuleDirs(): { dirName: string; moduleNum: number }[] {
  return fs
    .readdirSync(COURSE_SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+-/.test(entry.name))
    .map((entry) => ({ dirName: entry.name, moduleNum: Number(entry.name.match(/^(\d+)-/)![1]) }))
    .sort((a, b) => a.moduleNum - b.moduleNum);
}

export function readLessonFiles(moduleDir: string): { fileName: string; lessonNum: number; slugPart: string }[] {
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
  const frontmatter = (loadYaml(match[1]) as Record<string, unknown>) ?? {};
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

function isFocusChapter(fileName: string): boolean {
  return /-checklist\.md$/.test(fileName) || /-quiz\.md$/.test(fileName);
}

function isGateChecklistChapter(fileName: string): boolean {
  return /-checklist\.md$/.test(fileName) || fileName.includes("production-env-checklist");
}

/** Gate/quiz chapters should stay focused — no glossary cards or optional reads. */
function stripFocusChapterEnrichment(body: string): string {
  return body
    .replace(/<BigWordAlert[\s\S]*?\/>/g, "")
    .replace(/<RealWorldEvent[\s\S]*?\/>/g, "")
    .replace(/<MandatoryReadCard[\s\S]*?\/>/g, "")
    .replace(/<InterestingRead[\s\S]*?<\/InterestingRead>/g, "")
    .replace(/<ArticleBreak[\s\S]*?<\/ArticleBreak>/g, "")
    .replace(/<ChapterRecap[\s\S]*?\/>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Many gate checklists embed `### Learning log — write now` mid-checklist.
 * Move it to `## Learning log` right before "All boxes ticked?" — matches 3-10 layout.
 */
function normalizeGateLearningLog(body: string): string {
  const match = body.match(
    /(?:^|\n)###\s+Learning log[^\n]*\n\n([\s\S]*?)(?=\n##\s+)/
  );
  if (!match) return body;

  const section = match[1]!.trim();
  if (!/^\d+\.\s/m.test(section)) return body;

  const without = body.replace(match[0], "\n").replace(/\n{3,}/g, "\n\n");
  const block = `## Learning log\n\n${section}\n\n`;

  if (/## All boxes ticked/i.test(without)) {
    return without.replace(/(## All boxes ticked)/i, `${block}$1`);
  }
  return `${without.trim()}\n\n${block}`;
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
  withMarkers = withMarkers.replace(/<CheckpointIntro>[\s\S]*?<\/CheckpointIntro>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  withMarkers = withMarkers.replace(/<MandatoryReadCard[\s\S]*?\/>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  withMarkers = withMarkers.replace(/<BigWordAlert[\s\S]*?\/>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  withMarkers = withMarkers.replace(/<RealWorldEvent[\s\S]*?\/>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  withMarkers = withMarkers.replace(/<InterestingRead[\s\S]*?<\/InterestingRead>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  withMarkers = withMarkers.replace(/<ArticleBreak[\s\S]*?<\/ArticleBreak>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  withMarkers = withMarkers.replace(/<Callout[\s\S]*?<\/Callout>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  withMarkers = withMarkers.replace(/<ApiRequestPanel[\s\S]*?<\/ApiRequestPanel>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  const contentBlockPairs = [
    "ComparePanel",
    "FileTree",
    "TerminalBlock",
    "ArchitectureDiagram",
    "TraceRequest",
  ] as const;
  for (const tag of contentBlockPairs) {
    const re = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, "g");
    withMarkers = withMarkers.replace(re, (tagContent) => {
      blockTags.push(tagContent);
      return `\x00BLOCK${blockTags.length - 1}\x00`;
    });
  }
  withMarkers = withMarkers.replace(/<(DiffBlock|StateMachine|EntityDiagram)[\s\S]*?\/>/g, (tag) => {
    blockTags.push(tag);
    return `\x00BLOCK${blockTags.length - 1}\x00`;
  });
  withMarkers = withMarkers.replace(/<(Quiz|OpenQuestion|CodeExercise|ChapterRecap|ProjectPreview|LearningObjectives|Predict)\s+id="[^"]+"\s*\/>/g, (tag) => {
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

  let current: FaqPair | null = null;
  for (const block of blocks) {
    const match = block.match(/^\*\*Q:\s*(.+?)\*\*\s*\n(?:A:\s*)?([\s\S]*)$/);
    if (match) {
      current = { question: match[1]!.trim(), answer: match[2]!.trim() };
      items.push(current);
    } else if (current) {
      current.answer = `${current.answer}\n\n${block.trim()}`;
    }
  }
  return items;
}

/**
 * Turn prose Q/A lists into structured FaqGroup MDX.
 * Stop before the next heading or a block-level component so a diagram that
 * follows the questions is not folded into the last answer and escaped.
 * Question text is a JS string expression — JSX quoted attributes do not
 * understand `\"`, so a comma after an escaped quote breaks the tag.
 */
function transformFaqSections(body: string): string {
  return body.replace(
    /(?:^|\n)(## Common (?:beginner )?questions)\n\n([\s\S]*?)(?=\n## |\n<[A-Z]|\s*$)/g,
    (full, heading: string, section: string) => {
      const pairs = parseFaqPairs(section);
      if (pairs.length === 0) return full;

      const items = pairs
        .map(({ question, answer }) => {
          const questionAttr = `{${JSON.stringify(question)}}`;
          return `<FaqItem question=${questionAttr}>\n\n${escapeMdxInline(answer)}\n\n</FaqItem>`;
        })
        .join("\n\n");

      const prefix = full.startsWith("\n") ? "\n" : "";
      return `${prefix}${heading}\n\n<FaqGroup>\n\n${items}\n\n</FaqGroup>\n\n`;
    }
  );
}

/** Runs `transform` over the parts of `text` that do NOT match `pattern`, leaving matches untouched. */
function splitOutsideFences(text: string, pattern: RegExp, transform: (part: string) => string): string {
  const parts = text.split(pattern);
  const matches = text.match(pattern) ?? [];
  return parts.map((part, i) => (i < parts.length - 1 ? transform(part) + matches[i] : transform(part))).join("");
}

/** ```predict``` fenced YAML -> Predict block + placeholder tag. */
function transformPredictFences(body: string, pushBlock: (b: PendingBlock) => string): string {
  return body.replace(/```predict\n([\s\S]*?)```/g, (match, yamlText: string) => {
    let parsed: {
      prompt: string;
      options: { id: string; label: string }[];
      correctOptionId: string;
      explanation?: string;
      allowRetry?: boolean;
      context?: {
        method?: string;
        url?: string;
        bearer?: string;
        responseHint?: string;
      };
    };
    try {
      parsed = loadYaml(yamlText) as typeof parsed;
    } catch {
      return match;
    }
    if (!parsed?.prompt || !parsed.options?.length || !parsed.correctOptionId) return match;

    const id = ulid();
    return pushBlock({
      id,
      type: "PREDICT",
      required: false,
      config: {
        prompt: parsed.prompt,
        options: parsed.options,
        correctOptionId: parsed.correctOptionId,
        explanation: parsed.explanation,
        allowRetry: parsed.allowRetry ?? true,
        context: parsed.context,
      },
    });
  });
}

/** ```quiz``` fenced YAML -> real Quiz/OpenQuestion blocks + placeholder tags. */
function transformQuizFences(body: string, pushBlock: (b: PendingBlock) => string): string {
  return body.replace(/```quiz\n([\s\S]*?)```/g, (match, yamlText: string) => {
    let parsed: {
      type: "mcq" | "short";
      question: string;
      options?: string[];
      correct?: number;
      modelAnswer?: string;
      allowSpeechInput?: boolean;
      allowUrl?: boolean;
      urlLabel?: string;
      urlRequired?: boolean;
      urlHint?: string;
      minWords?: number;
    };
    try {
      parsed = loadYaml(yamlText) as typeof parsed;
    } catch {
      return match;
    }
    if (!parsed?.question) return match;

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
      config: {
        prompt: parsed.question,
        minWords: parsed.minWords ?? 0,
        sampleAnswer: parsed.modelAnswer,
        allowSpeechInput: parsed.allowSpeechInput ?? false,
        allowUrl: parsed.allowUrl ?? false,
        urlLabel: parsed.urlLabel,
        urlRequired: parsed.urlRequired ?? false,
        urlHint: parsed.urlHint,
      },
    });
  });
}

/** ```openquestion``` fenced YAML -> OpenQuestion with optional speech / URL fields. */
function transformOpenQuestionFences(body: string, pushBlock: (b: PendingBlock) => string): string {
  return body.replace(/```openquestion\n([\s\S]*?)```/g, (match, yamlText: string) => {
    let parsed: {
      prompt: string;
      minWords?: number;
      required?: boolean;
      allowSpeechInput?: boolean;
      speechPrimary?: boolean;
      submissionMode?: "text" | "url" | "url_required" | "article" | "video_demo";
      allowUrl?: boolean;
      urlLabel?: string;
      urlRequired?: boolean;
      urlHint?: string;
      modelAnswer?: string;
    };
    try {
      parsed = loadYaml(yamlText) as typeof parsed;
    } catch {
      return match;
    }
    if (!parsed?.prompt) return match;
    const id = ulid();
    return pushBlock({
      id,
      type: "OPEN_QUESTION",
      required: parsed.required ?? true,
      config: {
        prompt: parsed.prompt,
        minWords: parsed.minWords ?? 0,
        sampleAnswer: parsed.modelAnswer,
        allowSpeechInput: parsed.allowSpeechInput ?? false,
        speechPrimary: parsed.speechPrimary ?? false,
        submissionMode: parsed.submissionMode ?? "text",
        allowUrl: parsed.allowUrl ?? false,
        urlLabel: parsed.urlLabel,
        urlRequired: parsed.urlRequired ?? false,
        urlHint: parsed.urlHint,
      },
    });
  });
}

export function parseLesson(moduleNum: number, moduleDir: string, fileName: string, lessonNum: number, slugPart: string): ParsedLesson {
  const raw = fs.readFileSync(path.join(COURSE_SOURCE_DIR, moduleDir, fileName), "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);

  const blocks: PendingBlock[] = [];
  const pushBlock = (block: PendingBlock) => {
    blocks.push(block);
    return blockPlaceholderTag(block);
  };

  let source = stripStepTypeBlockquote(body);
  source = stripLeadingH1(source);
  if (isFocusChapter(fileName)) {
    source = stripFocusChapterEnrichment(source);
  }
  if (isGateChecklistChapter(fileName)) {
    source = normalizeGateLearningLog(source);
  }
  source = normalizePlaceholderUrls(source);
  source = transformPresentationBlocks(source, pushBlock);
  source = transformQuizFences(source, pushBlock);
  source = transformOpenQuestionFences(source, pushBlock);
  source = transformPredictFences(source, pushBlock);
  source = transformFaqSections(source);
  const isMilestone = /-checklist\.md$/.test(fileName);
  source = escapeMdxProse(source);

  const fallbackTitle = slugPart
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const stepType = String(frontmatter.stepType ?? "").toLowerCase();
  const estimatedRaw = frontmatter.estimatedMinutes;
  const estimatedMinutes =
    typeof estimatedRaw === "number"
      ? estimatedRaw
      : typeof estimatedRaw === "string"
        ? parseInt(estimatedRaw, 10)
        : null;
  const readerMode =
    stepType === "quiz" || /-quiz\.md$/.test(fileName) ? ("QUIZ" as const) : ("DEFAULT" as const);

  return {
    moduleNum,
    lessonNum,
    slugPart,
    title: cleanTitle(frontmatter.title as string | undefined, fallbackTitle),
    summary: (frontmatter.summary as string | undefined)?.trim() || null,
    estimatedMinutes: Number.isFinite(estimatedMinutes) ? estimatedMinutes : null,
    readerMode,
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
  const { findBrokenChapters } = await import("./validate-course-source");
  const { total, failed } = findBrokenChapters();
  if (failed.length > 0) {
    console.error(`Refusing to import — ${failed.length} of ${total} chapters do not compile:`);
    for (const failure of failed) console.error(`  ${failure.file}: ${failure.error}`);
    throw new Error("Course MDX validation failed");
  }
  console.log(`MDX ok: ${total} chapters`);

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
          estimatedMinutes: lesson.estimatedMinutes,
          readerMode: lesson.readerMode,
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
          estimatedMinutes: lesson.estimatedMinutes,
          readerMode: lesson.readerMode,
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

const invokedDirectly =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
