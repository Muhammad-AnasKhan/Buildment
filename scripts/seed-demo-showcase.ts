import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type BlockType, type ResponseStatus } from "../src/generated/prisma/client";
import { SEED_COURSE, SEED_USERS } from "../src/lib/seed-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const COMPLETABLE = new Set<BlockType>([
  "QUIZ",
  "TEST",
  "MUST_READ",
  "OPEN_QUESTION",
  "CODE",
  "PREDICT",
]);
const COMPLETE_STATUSES = new Set<ResponseStatus>([
  "SUBMITTED",
  "AUTO_GRADED",
  "PENDING_REVIEW",
  "REVIEWED",
  "NEEDS_REVISION",
]);

type DemoUser = {
  id: string;
  email: string;
};

type DemoEnrollment = {
  id: string;
  userId: string;
  courseId: string;
};

type DemoBlock = {
  id: string;
  type: BlockType;
  points: number;
  required: boolean;
  archivedAt: Date | null;
  config: unknown;
};

type DemoChapter = {
  id: string;
  slug: string;
  title: string;
  order: number;
  moduleTitle: string;
  blocks: DemoBlock[];
};

function daysAgo(days: number, hour = 14) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

function dateOnly(days: number) {
  const date = daysAgo(days, 0);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function configRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function answerFor(chapter: DemoChapter, block: DemoBlock, variant: number) {
  const config = configRecord(block.config);
  const prompt = typeof config.prompt === "string" ? config.prompt.toLowerCase() : "";
  if (prompt.includes("problem this marketplace solves")) {
    return "Local buyers currently jump between separate shops to compare stock, prices, and delivery. Small sellers have the opposite problem: they need an online storefront but cannot justify building one alone. FreshMarket gives buyers one catalogue and checkout while each vendor still owns their products and fulfils their part of the order.";
  }
  if (prompt.includes("week 2") && prompt.includes("week 4")) {
    return "By the end of week 2 I should be able to demo a vendor creating a store, publishing products, and seeing incoming orders. By week 4 the customer journey should also work, including search, cart, checkout, and a public deployment. The middle of the project connects those two sides without losing vendor ownership boundaries.";
  }
  if (prompt.includes("gate lesson")) {
    return "A Gate lesson is the proof step at the end of a chapter. I complete the practical checklist and answer the reflection questions so the work is both demonstrable and understood. If either part is unfinished, the next chapter stays locked instead of letting me build on a gap.";
  }
  if (prompt.includes("functional requirement")) {
    return "A functional requirement is that one customer can add products from several vendors to a single cart and check out once. A non-functional requirement is that vendor data remains isolated and the checkout stays responsive. The first describes behaviour; the second describes the quality and safety of that behaviour.";
  }
  if (prompt.includes("server/ and client/") || prompt.includes("one git repository")) {
    return "Keeping the server and client in one repository makes API changes, shared conventions, and end-to-end demos easier to coordinate without version drift.";
  }
  if (prompt.includes("erd") || Boolean(config.urlRequired)) {
    return "I mapped users, stores, products, carts, orders, and immutable order-line snapshots. Product and store records stay referenced while checkout copies the purchased name, unit, quantity, and price into each order line so history does not change later.";
  }

  const reflections = [
    `The main takeaway from ${chapter.title} is to make the boundary explicit before adding more code. For FreshMarket, I wrote down who owns the data, what can change, and what must remain stable so the next implementation step has a clear test.`,
    `${chapter.title} helped me connect the technical choice to an actual marketplace flow. I can now explain the decision using the vendor and customer journeys instead of only naming a tool or pattern.`,
    `I treated ${chapter.title} as a small design checkpoint: state the assumption, build the thinnest proof, and record what would make the decision wrong. That gives me something concrete to verify in the next lesson.`,
  ];
  return reflections[variant % reflections.length];
}

function payloadFor(chapter: DemoChapter, block: DemoBlock, variant: number) {
  const config = configRecord(block.config);
  if (block.type === "OPEN_QUESTION") {
    const urlRequired = config.urlRequired === true;
    return {
      type: "OPEN_QUESTION",
      text: answerFor(chapter, block, variant),
      ...(urlRequired
        ? { url: "https://github.com/buildment-demo/freshmarket/blob/main/docs/erd-draft.md" }
        : {}),
    };
  }
  if (block.type === "QUIZ" || block.type === "TEST") {
    const selected = Array.isArray(config.correctOptionIds)
      ? config.correctOptionIds.filter((item): item is string => typeof item === "string")
      : [];
    return { type: block.type, selected };
  }
  if (block.type === "PREDICT") {
    return {
      type: "PREDICT",
      selected: typeof config.correctOptionId === "string" ? config.correctOptionId : "a",
    };
  }
  if (block.type === "MUST_READ") return { type: "MUST_READ", acknowledged: true };
  if (block.type === "CODE") return { type: "CODE", passed: true, output: "All checks passed" };
  return { type: block.type, completed: true };
}

function mentorFeedback(chapter: DemoChapter, variant: number) {
  const feedback = [
    `Good connection to the FreshMarket flow. You named the decision and explained why it matters. On the next step, keep the same level of specificity when you turn it into code.`,
    `Clear and practical. The strongest part is that you tied the idea to ownership and user behaviour rather than repeating terminology. Keep this as a reference when you implement the chapter deliverable.`,
    `This is ready to move forward. You have the core trade-off right and your explanation is easy to verify. Add the same reasoning to your project notes so the decision is visible in the repository.`,
  ];
  return `${feedback[variant % feedback.length]} — ${chapter.title}`;
}

async function ensureCompletedResponse(args: {
  learner: DemoUser;
  enrollment: DemoEnrollment;
  mentor: DemoUser;
  chapter: DemoChapter;
  block: DemoBlock;
  key: string;
  occurredAt: Date;
  variant: number;
}) {
  const latest = await prisma.response.findFirst({
    where: { blockId: args.block.id, userId: args.learner.id },
    orderBy: { attempt: "desc" },
    select: { status: true, attempt: true },
  });
  if (latest && COMPLETE_STATUSES.has(latest.status) && latest.status !== "NEEDS_REVISION") return;

  const id = `showcase-${args.key}`;
  if (await prisma.response.findUnique({ where: { id }, select: { id: true } })) return;

  const attempt = (latest?.attempt ?? 0) + 1;
  const isHumanReviewed = args.block.type === "OPEN_QUESTION";
  await prisma.$transaction(async (tx) => {
    await tx.response.create({
      data: {
        id,
        blockId: args.block.id,
        userId: args.learner.id,
        enrollmentId: args.enrollment.id,
        attempt,
        status: isHumanReviewed ? "REVIEWED" : "AUTO_GRADED",
        payload: payloadFor(args.chapter, args.block, args.variant),
        score: args.block.points,
        maxScore: args.block.points,
        isCorrect: isHumanReviewed ? null : true,
        durationMs: 90_000 + args.variant * 7_500,
        startedAt: new Date(args.occurredAt.getTime() - 8 * 60_000),
        submittedAt: args.occurredAt,
      },
    });
    if (isHumanReviewed) {
      await tx.review.create({
        data: {
          id: `${id}-review`,
          responseId: id,
          reviewerId: args.mentor.id,
          feedback: mentorFeedback(args.chapter, args.variant),
          verdict: "APPROVED",
          score: args.block.points,
          createdAt: new Date(args.occurredAt.getTime() + 3 * 60 * 60_000),
        },
      });
    }
  });
}

async function ensurePendingResponse(args: {
  learner: DemoUser;
  enrollment: DemoEnrollment;
  chapter: DemoChapter;
  block: DemoBlock;
  key: string;
  occurredAt: Date;
  answer: string;
  url?: string;
}) {
  const id = `showcase-${args.key}`;
  if (await prisma.response.findUnique({ where: { id }, select: { id: true } })) return;
  const latest = await prisma.response.findFirst({
    where: { blockId: args.block.id, userId: args.learner.id },
    orderBy: { attempt: "desc" },
    select: { attempt: true, status: true },
  });
  if (latest?.status === "PENDING_REVIEW") return;

  await prisma.response.create({
    data: {
      id,
      blockId: args.block.id,
      userId: args.learner.id,
      enrollmentId: args.enrollment.id,
      attempt: (latest?.attempt ?? 0) + 1,
      status: "PENDING_REVIEW",
      payload: {
        type: "OPEN_QUESTION",
        text: args.answer,
        ...(args.url ? { url: args.url } : {}),
      },
      startedAt: new Date(args.occurredAt.getTime() - 12 * 60_000),
      submittedAt: args.occurredAt,
    },
  });
}

async function syncChapterProgress(enrollment: DemoEnrollment, chapter: DemoChapter, forceComplete: boolean) {
  const blocks = chapter.blocks.filter(
    (block) => block.required && !block.archivedAt && COMPLETABLE.has(block.type),
  );
  let blocksCompleted = 0;
  let score = 0;
  let maxScore = 0;
  for (const block of blocks) {
    const latest = await prisma.response.findFirst({
      where: { blockId: block.id, userId: enrollment.userId },
      orderBy: { attempt: "desc" },
      select: { status: true, score: true, maxScore: true },
    });
    if (!latest || !COMPLETE_STATUSES.has(latest.status)) continue;
    blocksCompleted += 1;
    score += latest.score ?? 0;
    maxScore += latest.maxScore ?? 0;
  }

  const existing = await prisma.chapterProgress.findUnique({
    where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id } },
  });
  const completed = blocks.length === 0 ? forceComplete : blocksCompleted >= blocks.length;
  const status = completed ? "COMPLETED" : blocksCompleted > 0 || existing ? "IN_PROGRESS" : "NOT_STARTED";
  const occurredAt = existing?.startedAt ?? daysAgo(30);

  await prisma.chapterProgress.upsert({
    where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId: chapter.id } },
    create: {
      enrollmentId: enrollment.id,
      chapterId: chapter.id,
      status,
      blocksCompleted,
      blocksTotal: blocks.length,
      score,
      maxScore,
      timeSpentSeconds: 1_200 + chapter.order * 95,
      startedAt: occurredAt,
      completedAt: completed ? occurredAt : null,
    },
    update: {
      status,
      blocksCompleted,
      blocksTotal: blocks.length,
      score,
      maxScore,
      completedAt: completed ? (existing?.completedAt ?? occurredAt) : null,
    },
  });
}

async function syncEnrollment(enrollment: DemoEnrollment, lastActiveAt: Date) {
  const [progress, totalChapters, pendingReviews] = await Promise.all([
    prisma.chapterProgress.findMany({ where: { enrollmentId: enrollment.id } }),
    prisma.chapter.count({ where: { courseId: enrollment.courseId } }),
    prisma.response.count({ where: { enrollmentId: enrollment.id, status: "PENDING_REVIEW" } }),
  ]);
  const chaptersCompleted = progress.filter((item) => item.status === "COMPLETED").length;
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: chaptersCompleted >= totalChapters ? "COMPLETED" : "IN_PROGRESS",
      chaptersCompleted,
      percentComplete: totalChapters ? Math.round((chaptersCompleted / totalChapters) * 100) : 0,
      totalScore: progress.reduce((sum, item) => sum + item.score, 0),
      maxScore: progress.reduce((sum, item) => sum + item.maxScore, 0),
      pendingReviews,
      startedAt: daysAgo(45),
      lastActiveAt,
    },
  });
}

async function syncBlockStats(courseId: string) {
  const blocks = await prisma.block.findMany({ where: { chapter: { courseId } }, select: { id: true } });
  for (const block of blocks) {
    const [attempts, correctCount, pendingReviews, latest] = await Promise.all([
      prisma.response.count({ where: { blockId: block.id } }),
      prisma.response.count({ where: { blockId: block.id, isCorrect: true } }),
      prisma.response.count({ where: { blockId: block.id, status: "PENDING_REVIEW" } }),
      prisma.response.findFirst({
        where: { blockId: block.id },
        orderBy: { submittedAt: "desc" },
        select: { submittedAt: true },
      }),
    ]);
    if (attempts === 0) continue;
    await prisma.blockStats.upsert({
      where: { blockId: block.id },
      create: { blockId: block.id, attempts, correctCount, pendingReviews, lastSubmittedAt: latest?.submittedAt },
      update: { attempts, correctCount, pendingReviews, lastSubmittedAt: latest?.submittedAt },
    });
  }
}

async function seedActivity(enrollment: DemoEnrollment, chapterIds: string[], minutes: number[]) {
  for (let index = 0; index < minutes.length; index += 1) {
    const date = dateOnly(minutes.length - 1 - index);
    await prisma.dailyActivity.upsert({
      where: { enrollmentId_date: { enrollmentId: enrollment.id, date } },
      create: { enrollmentId: enrollment.id, date, activeSeconds: minutes[index] * 60 },
      update: {},
    });
  }

  for (let index = 0; index < Math.min(4, chapterIds.length); index += 1) {
    const id = `showcase-session-${enrollment.id}-${index}`;
    if (await prisma.studySession.findUnique({ where: { id }, select: { id: true } })) continue;
    const startedAt = daysAgo(index, 11 + index);
    await prisma.studySession.create({
      data: {
        id,
        enrollmentId: enrollment.id,
        chapterId: chapterIds[index],
        status: "ENDED",
        startedAt,
        endedAt: new Date(startedAt.getTime() + minutes[minutes.length - 1 - index] * 60_000),
        activeSeconds: minutes[minutes.length - 1 - index] * 60,
      },
    });
  }
}

async function seedHelpThreads(args: {
  courseId: string;
  learner: DemoUser;
  mentor: DemoUser;
  chapterIds: string[];
}) {
  const threads = [
    {
      id: `showcase-help-${args.learner.id}-resolved`,
      chapterId: args.chapterIds[0],
      status: "RESOLVED" as const,
      createdAt: daysAgo(8),
      resolvedAt: daysAgo(7),
      messages: [
        { authorId: args.learner.id, body: "I understand the folder structure, but I am not sure where validation should live so both the route and service can use it." },
        { authorId: args.mentor.id, body: "Keep the schema beside the feature module and validate at the route boundary. Pass the parsed value into the service so the service never handles unchecked input." },
      ],
    },
    {
      id: `showcase-help-${args.learner.id}-open`,
      chapterId: args.chapterIds[1] ?? args.chapterIds[0],
      status: "OPEN" as const,
      createdAt: daysAgo(1),
      resolvedAt: null,
      messages: [
        { authorId: args.learner.id, body: "Could you check whether my order snapshot has enough fields? I copied product name, unit, quantity, and price but kept the live product reference too." },
      ],
    },
  ];

  for (const thread of threads) {
    if (await prisma.helpThread.findUnique({ where: { id: thread.id }, select: { id: true } })) continue;
    await prisma.helpThread.create({
      data: {
        id: thread.id,
        courseId: args.courseId,
        chapterId: thread.chapterId,
        menteeId: args.learner.id,
        status: thread.status,
        createdAt: thread.createdAt,
        updatedAt: thread.resolvedAt ?? thread.createdAt,
        resolvedAt: thread.resolvedAt,
        messages: {
          create: thread.messages.map((message, index) => ({
            id: `${thread.id}-message-${index}`,
            authorId: message.authorId,
            body: message.body,
            createdAt: new Date(thread.createdAt.getTime() + index * 60 * 60_000),
          })),
        },
      },
    });
  }
}

async function seedLearner(args: {
  learner: DemoUser;
  enrollment: DemoEnrollment;
  mentor: DemoUser;
  chapters: DemoChapter[];
  completedChapterCount: number;
  key: string;
  lastActiveAt: Date;
}) {
  const historical = args.chapters.slice(0, args.completedChapterCount);
  for (let chapterIndex = 0; chapterIndex < historical.length; chapterIndex += 1) {
    const chapter = historical[chapterIndex];
    const blocks = chapter.blocks.filter(
      (block) => block.required && !block.archivedAt && COMPLETABLE.has(block.type),
    );
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
      await ensureCompletedResponse({
        learner: args.learner,
        enrollment: args.enrollment,
        mentor: args.mentor,
        chapter,
        block: blocks[blockIndex],
        key: `${args.key}-${chapterIndex}-${blockIndex}`,
        occurredAt: daysAgo(Math.max(1, args.completedChapterCount - chapterIndex), 12 + (blockIndex % 4)),
        variant: chapterIndex + blockIndex,
      });
    }
    await syncChapterProgress(args.enrollment, chapter, true);
  }
  await syncEnrollment(args.enrollment, args.lastActiveAt);
}

async function main() {
  const mentorEmail = SEED_USERS.find((user) => user.role === "MENTOR")?.email;
  if (!mentorEmail) throw new Error("The base seed must define one mentor.");
  const mentor = await prisma.user.findUniqueOrThrow({ where: { email: mentorEmail } });
  const learners = await prisma.user.findMany({
    where: { email: { in: SEED_USERS.filter((user) => user.role === "MENTEE").map((user) => user.email) } },
    orderBy: { email: "asc" },
  });
  const course = await prisma.course.findUniqueOrThrow({
    where: { slug: SEED_COURSE.slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: { blocks: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
  const chapters: DemoChapter[] = course.modules.flatMap((module) =>
    module.chapters.map((chapter) => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      order: chapter.order,
      moduleTitle: module.title,
      blocks: chapter.blocks,
    })),
  );
  if (chapters.length < 20) throw new Error("Import the course content before running the showcase seed.");

  const enrollmentRows = await prisma.enrollment.findMany({
    where: { courseId: course.id, userId: { in: learners.map((learner) => learner.id) } },
  });
  const enrollmentByUser = new Map(enrollmentRows.map((item) => [item.userId, item]));
  const plans = [
    { email: "mentee1@buildment.dev", complete: 42, key: "ada", active: new Date(Date.now() - 35 * 60_000) },
    { email: "mentee2@buildment.dev", complete: 14, key: "ben", active: daysAgo(9) },
    { email: "mentee3@buildment.dev", complete: 31, key: "cy", active: daysAgo(1) },
  ];

  for (const plan of plans) {
    const learner = learners.find((item) => item.email === plan.email);
    const enrollment = learner ? enrollmentByUser.get(learner.id) : null;
    if (!learner || !enrollment) throw new Error(`Missing base enrollment for ${plan.email}. Run pnpm db:seed first.`);
    await seedLearner({
      learner,
      enrollment,
      mentor,
      chapters,
      completedChapterCount: plan.complete,
      key: plan.key,
      lastActiveAt: plan.active,
    });
  }

  const primary = learners.find((item) => item.email === "mentee1@buildment.dev");
  const primaryEnrollment = primary ? enrollmentByUser.get(primary.id) : null;
  if (!primary || !primaryEnrollment) throw new Error("Primary demo mentee is missing.");

  const pendingCandidates = chapters
    .slice(42)
    .flatMap((chapter) =>
      chapter.blocks
        .filter((block) => block.type === "OPEN_QUESTION")
        .map((block) => ({ chapter, block })),
    )
    .slice(0, 2);
  const pendingAnswers = [
    "I would keep the product reference for current catalogue lookups, but store the purchased name, unit, quantity, and unit price inside the order. That means an old receipt stays correct even if the vendor edits or removes the product later.",
    "My first test covers the happy path, then I change ownership and verify the same request is rejected. I also want one test for a missing session because authorization bugs often hide behind a valid local user.",
  ];
  for (let index = 0; index < pendingCandidates.length; index += 1) {
    const item = pendingCandidates[index];
    await ensurePendingResponse({
      learner: primary,
      enrollment: primaryEnrollment,
      chapter: item.chapter,
      block: item.block,
      key: `ada-pending-${index}`,
      occurredAt: new Date(Date.now() - (index + 1) * 70 * 60_000),
      answer: pendingAnswers[index],
    });
    await syncChapterProgress(primaryEnrollment, item.chapter, false);
  }

  const evidence = chapters
    .flatMap((chapter) => chapter.blocks.map((block) => ({ chapter, block })))
    .find(({ block }) => block.type === "OPEN_QUESTION" && configRecord(block.config).urlRequired === true);
  if (evidence) {
    await ensurePendingResponse({
      learner: primary,
      enrollment: primaryEnrollment,
      chapter: evidence.chapter,
      block: evidence.block,
      key: "ada-project-evidence",
      occurredAt: daysAgo(2),
      answer: "This ERD shows the ownership chain and the order-line snapshot. I added notes beside each embedded field so the reason for copying it is reviewable.",
      url: "https://github.com/buildment-demo/freshmarket/blob/main/docs/erd-draft.md",
    });
    await syncChapterProgress(primaryEnrollment, evidence.chapter, false);
  }

  await seedActivity(primaryEnrollment, chapters.slice(35, 39).map((item) => item.id), [28, 46, 0, 52, 34, 61, 43]);
  const cy = learners.find((item) => item.email === "mentee3@buildment.dev");
  const cyEnrollment = cy ? enrollmentByUser.get(cy.id) : null;
  if (cyEnrollment) await seedActivity(cyEnrollment, chapters.slice(25, 29).map((item) => item.id), [18, 0, 24, 31, 0, 38, 26]);
  await seedHelpThreads({
    courseId: course.id,
    learner: primary,
    mentor,
    chapterIds: [chapters[18].id, chapters[32].id],
  });

  await syncEnrollment(primaryEnrollment, new Date(Date.now() - 35 * 60_000));
  await syncBlockStats(course.id);

  const summary = await prisma.enrollment.findMany({
    where: { courseId: course.id, userId: { in: learners.map((item) => item.id) } },
    orderBy: { user: { email: "asc" } },
    select: {
      user: { select: { email: true } },
      percentComplete: true,
      chaptersCompleted: true,
      pendingReviews: true,
      lastActiveAt: true,
    },
  });
  console.log("Showcase demo data is ready:");
  for (const item of summary) {
    console.log(
      `  ${item.user.email}: ${item.percentComplete}% · ${item.chaptersCompleted} chapters · ${item.pendingReviews} pending reviews`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
