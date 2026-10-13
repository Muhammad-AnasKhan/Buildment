import { prisma } from "../../db/prisma.js";
import { sendInactivityNudgesForCourse } from "../nudges/inactivity.js";

/** Email inactive learners across every published course. Returns how many went out. */
export async function runInactivityNudges(): Promise<{ emailsSent: number; courses: number }> {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true },
  });

  let emailsSent = 0;
  for (const course of courses) {
    const { sent } = await sendInactivityNudgesForCourse(course.id);
    emailsSent += sent;
  }
  return { emailsSent, courses: courses.length };
}
