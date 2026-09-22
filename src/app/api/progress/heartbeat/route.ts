import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { recordStudyHeartbeat } from "@/server/progress/heartbeat";

const BodySchema = z.object({
  chapterId: z.string().min(1),
  deltaSeconds: z.number().int().positive().max(20).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: chapter.courseId, userId: user.id } },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  const deltaSeconds = parsed.data.deltaSeconds ?? 15;

  const result = await prisma.$transaction((tx) =>
    recordStudyHeartbeat(tx, {
      enrollmentId: enrollment.id,
      userId: user.id,
      chapterId: chapter.id,
      courseId: chapter.courseId,
      deltaSeconds,
    })
  );

  const chapterTimeSpentSeconds = await prisma.chapterProgress
    .findUnique({
      where: {
        enrollmentId_chapterId: {
          enrollmentId: enrollment.id,
          chapterId: chapter.id,
        },
      },
      select: { timeSpentSeconds: true },
    })
    .then((p) => p?.timeSpentSeconds ?? 0);

  return NextResponse.json({
    creditedSeconds: result.creditedSeconds,
    chapterTimeSpentSeconds,
    sessionActiveSeconds: result.sessionActiveSeconds,
    sessionStatus: result.sessionStatus,
  });
}
