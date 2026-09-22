import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { clientSessionStatus, controlStudySession } from "@/server/progress/study-session";

const BodySchema = z.object({
  chapterId: z.string().min(1),
  action: z.enum(["start", "pause", "resume", "end"]),
  deltaSeconds: z.number().int().positive().max(20).optional(),
});

async function enrolledChapter(chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) return { error: NextResponse.json({ error: "Chapter not found" }, { status: 404 }) };

  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: chapter.courseId, userId: user.id } },
  });
  if (!enrollment) {
    return { error: NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 }) };
  }

  return { chapter, user, enrollment };
}

async function chapterTime(enrollmentId: string, chapterId: string) {
  const progress = await prisma.chapterProgress.findUnique({
    where: { enrollmentId_chapterId: { enrollmentId, chapterId } },
    select: { timeSpentSeconds: true },
  });
  return progress?.timeSpentSeconds ?? 0;
}

export async function GET(request: Request) {
  const chapterId = new URL(request.url).searchParams.get("chapterId") ?? "";
  if (!chapterId) return NextResponse.json({ error: "Missing chapter" }, { status: 400 });

  const loaded = await enrolledChapter(chapterId);
  if ("error" in loaded) return loaded.error;

  const open = await prisma.studySession.findFirst({
    where: {
      enrollmentId: loaded.enrollment.id,
      chapterId,
      status: { in: ["RUNNING", "PAUSED"] },
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json({
    status: clientSessionStatus(open?.status),
    activeSeconds: open?.activeSeconds ?? 0,
    chapterTimeSpentSeconds: await chapterTime(loaded.enrollment.id, chapterId),
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const loaded = await enrolledChapter(parsed.data.chapterId);
  if ("error" in loaded) return loaded.error;

  const session = await prisma.$transaction((tx) =>
    controlStudySession(tx, {
      enrollmentId: loaded.enrollment.id,
      userId: loaded.user.id,
      chapterId: loaded.chapter.id,
      courseId: loaded.chapter.courseId,
      action: parsed.data.action,
      deltaSeconds: parsed.data.deltaSeconds,
    })
  );

  const ended = parsed.data.action === "end";
  return NextResponse.json({
    status: ended ? "idle" : clientSessionStatus(session?.status),
    activeSeconds: ended ? 0 : (session?.activeSeconds ?? 0),
    chapterTimeSpentSeconds: await chapterTime(loaded.enrollment.id, loaded.chapter.id),
  });
}
