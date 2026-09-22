import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sendInactivityNudgesForCourse } from "@/server/nudges/inactivity";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true },
  });

  let totalSent = 0;
  for (const course of courses) {
    const { sent } = await sendInactivityNudgesForCourse(course.id);
    totalSent += sent;
  }

  return NextResponse.json({ ok: true, emailsSent: totalSent });
}
