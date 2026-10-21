import { randomBytes } from "node:crypto";
import type { CourseInstructorInviteResult, CourseTeamView } from "../../shared/api/teach.js";
import type { SessionUser } from "../../types/auth.js";
import { prisma } from "../../db/prisma.js";
import { env } from "../../config/env.js";
import { ConflictError, ForbiddenError, NotFoundError, UnprocessableError } from "../../utils/errors.js";
import { sendEmail } from "../email/send.js";
import { requireCourseById, requireCourseBySlug } from "./access.js";
import type { z } from "zod";
import type { courseInstructorInviteBody } from "../../validations/teach.js";

type InviteBody = z.infer<typeof courseInstructorInviteBody>;
const expiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export async function loadCourseTeam(user: SessionUser, slug: string): Promise<CourseTeamView> {
  const owned = await requireCourseBySlug(user, slug);
  const course = await prisma.course.findUniqueOrThrow({
    where: { id: owned.id },
    select: {
      mentor: { select: { id: true, name: true, email: true } },
      instructors: { orderBy: { createdAt: "asc" }, select: { role: true, user: { select: { id: true, name: true, email: true } } } },
      instructorInvites: { where: { acceptedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" }, select: { id: true, email: true, role: true, token: true, expiresAt: true } },
    },
  });
  return {
    owner: course.mentor,
    instructors: course.instructors.map((item) => ({ ...item.user, role: item.role })),
    invites: course.instructorInvites.map((invite) => ({ id: invite.id, email: invite.email, role: invite.role, url: `${env.APP_URL}/instructor-invites/${invite.token}`, expiresAt: invite.expiresAt.toISOString() })),
  };
}

export async function inviteCourseInstructor(user: SessionUser, courseId: string, input: InviteBody): Promise<CourseInstructorInviteResult> {
  const course = await requireCourseById(user, courseId);
  const email = input.email.trim().toLowerCase();
  if (email === user.email.toLowerCase()) throw new UnprocessableError("You already own this course.", "INVALID_COURSE_INVITE");
  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existingUser?.id === course.mentorId) throw new UnprocessableError("The course owner is already on the team.", "INVALID_COURSE_INVITE");
  if (existingUser && existingUser.role !== "MENTOR" && existingUser.role !== "ADMIN") {
    throw new UnprocessableError("This account does not have instructor access yet.", "INSTRUCTOR_ACCESS_REQUIRED");
  }
  if (existingUser) {
    const member = await prisma.courseInstructor.findUnique({ where: { courseId_userId: { courseId, userId: existingUser.id } }, select: { id: true } });
    if (member) throw new ConflictError("This instructor is already on the course team.", "COURSE_INSTRUCTOR_EXISTS");
  }
  const pending = await prisma.courseInstructorInvite.findFirst({ where: { courseId, email, acceptedAt: null, expiresAt: { gt: new Date() } } });
  const invite = pending
    ? await prisma.courseInstructorInvite.update({ where: { id: pending.id }, data: { role: input.role }, select: { token: true } })
    : await prisma.courseInstructorInvite.create({
        data: { courseId, email, role: input.role, token: randomBytes(24).toString("base64url"), invitedById: user.id, expiresAt: expiry() },
        select: { token: true },
      });
  const url = `${env.APP_URL}/instructor-invites/${invite.token}`;
  const senderName = escapeHtml(user.name ?? "A course instructor");
  const courseTitle = escapeHtml(course.title);
  const sent = await sendEmail({
    to: email,
    subject: `Invitation to help teach ${course.title}`,
    html: `<p>${senderName} invited you to join the Buildment course team for <strong>${courseTitle}</strong>.</p><p>Role: ${input.role === "COURSE_CREATOR" ? "Course creator" : "Submission evaluator"}.</p><p><a href="${url}">Review and accept the invitation</a></p><p>This link expires in seven days. You need an instructor-enabled account to accept it.</p>`,
    text: `${user.name ?? "A course instructor"} invited you to join the Buildment course team for "${course.title}" as ${input.role === "COURSE_CREATOR" ? "a course creator" : "a submission evaluator"}. Accept the invitation here: ${url}\n\nThis link expires in seven days. You must sign in with an instructor-enabled account to accept it.`,
  });
  return { url, emailSent: sent.sent };
}

export async function acceptCourseInstructorInvite(user: SessionUser, token: string): Promise<{ courseSlug: string; role: "COURSE_CREATOR" | "SUBMISSION_EVALUATOR" }> {
  if (user.role !== "MENTOR" && user.role !== "ADMIN") throw new ForbiddenError("Instructor access is required to accept this invitation.", "INSTRUCTOR_REQUIRED");
  const invite = await prisma.courseInstructorInvite.findUnique({ where: { token }, include: { course: { select: { slug: true } } } });
  if (!invite || invite.acceptedAt || invite.expiresAt <= new Date()) throw new NotFoundError("This instructor invitation is invalid or has expired.");
  if (invite.email.toLowerCase() !== user.email.toLowerCase()) throw new ForbiddenError("Sign in with the email address this invitation was sent to.", "COURSE_INVITE_EMAIL_MISMATCH");
  await prisma.$transaction(async (tx) => {
    await tx.courseInstructor.upsert({
      where: { courseId_userId: { courseId: invite.courseId, userId: user.id } },
      update: { role: invite.role },
      create: { courseId: invite.courseId, userId: user.id, role: invite.role },
    });
    await tx.courseInstructorInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
  });
  return { courseSlug: invite.course.slug, role: invite.role };
}

export async function removeCourseInstructor(user: SessionUser, courseId: string, userId: string): Promise<void> {
  await requireCourseById(user, courseId);
  if (userId === user.id) throw new UnprocessableError("Course owners cannot remove themselves from the team.", "INVALID_COURSE_TEAM_CHANGE");
  const removed = await prisma.courseInstructor.deleteMany({ where: { courseId, userId } });
  if (!removed.count) throw new NotFoundError("Course team member not found.");
}

export async function revokeCourseInstructorInvite(user: SessionUser, courseId: string, inviteId: string): Promise<void> {
  await requireCourseById(user, courseId);
  const deleted = await prisma.courseInstructorInvite.deleteMany({ where: { id: inviteId, courseId, acceptedAt: null } });
  if (!deleted.count) throw new NotFoundError("Pending course invitation not found.");
}
