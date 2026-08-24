"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireMentorOfCourse, requireUser } from "@/server/auth/guards";
import { inviteAcceptUrl, sendEmail } from "@/server/email/send";

// Assignment + invite flows (docs/phases/m7-assignment-and-polish.mdx).
// Authorization always goes through the guards in server/auth — the mentee
// side of this file (acceptInvite) requires only a signed-in user, since
// brand-new accounts accept invites before they have any role history.

const INVITE_TTL_DAYS = 14;

export type InviteActionResult = { ok: true } | { ok: false; errors: string[] };

export type AssignByEmailsResult =
  | {
      ok: true;
      enrolledEmails: string[];
      invitedEmails: string[];
      emailFailed: boolean;
    }
  | { ok: false; errors: string[] };

function newInviteToken() {
  return randomBytes(24).toString("base64url");
}

function inviteExpiry() {
  return new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

function normalizeEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  const parsed = z.string().email().safeParse(trimmed);
  return parsed.success ? trimmed : null;
}

async function sendInviteEmail(input: {
  to: string;
  token: string;
  courseTitle: string;
  mentorName: string | null;
}): Promise<boolean> {
  const url = inviteAcceptUrl(input.token);
  const mentor = input.mentorName ?? "Your mentor";
  const result = await sendEmail({
    to: input.to,
    subject: `${mentor} invited you to "${input.courseTitle}" on buildment`,
    text: `${mentor} invited you to the course "${input.courseTitle}" on buildment.\n\nOpen this link to create your profile and start learning:\n${url}\n\nThe invite expires in ${INVITE_TTL_DAYS} days.`,
    html: `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;color:#0a0a0a">
        <p style="font-size:15px;line-height:1.6">
          <strong>${mentor}</strong> invited you to the course
          <strong>${input.courseTitle}</strong> on buildment.
        </p>
        <p style="margin:24px 0">
          <a href="${url}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:9999px">
            Accept invite &amp; start learning
          </a>
        </p>
        <p style="font-size:13px;color:#737373;line-height:1.6">
          Or paste this link into your browser:<br/>
          <a href="${url}" style="color:#4f46e5">${url}</a>
        </p>
        <p style="font-size:12px;color:#a3a3a3;margin-top:24px">
          This invite expires in ${INVITE_TTL_DAYS} days. If you don't have a buildment
          profile yet, you'll create one when you open the link.
        </p>
      </div>
    `,
  });
  return result.sent;
}

/**
 * Mentor assigns a course by email. Emails that already have an account get an
 * Enrollment immediately (assignedById = mentor); the rest get an email-bound
 * Invite whose acceptance creates the enrollment (M7 spec).
 */
export async function assignByEmails(input: {
  courseId: string;
  emailsRaw: string;
}): Promise<AssignByEmailsResult> {
  const user = await requireMentorOfCourse(input.courseId);

  const emails = Array.from(
    new Set(
      input.emailsRaw
        .split(/[\n,;\s]+/)
        .map(normalizeEmail)
        .filter((email): email is string => email !== null)
    )
  );
  if (emails.length === 0) {
    return { ok: false, errors: ["Enter at least one valid email address."] };
  }

  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: { id: true, status: true, title: true },
  });
  if (!course) return { ok: false, errors: ["Course not found."] };
  if (course.status !== "PUBLISHED") {
    return { ok: false, errors: ["Publish the course before assigning it to mentees."] };
  }

  const enrolledEmails: string[] = [];
  const invitedEmails: string[] = [];
  let emailFailed = false;

  for (const email of emails) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      await prisma.enrollment.upsert({
        where: { courseId_userId: { courseId: course.id, userId: existingUser.id } },
        update: { status: "ASSIGNED" },
        create: {
          courseId: course.id,
          userId: existingUser.id,
          status: "ASSIGNED",
          assignedById: user.id,
        },
      });
      enrolledEmails.push(email);
      continue;
    }

    // Reuse a still-valid pending invite for this course+email instead of
    // stacking duplicates when a mentor re-sends.
    let invite = await prisma.invite.findFirst({
      where: {
        courseId: course.id,
        email,
        acceptedAt: null,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!invite) {
      invite = await prisma.invite.create({
        data: {
          token: newInviteToken(),
          courseId: course.id,
          email,
          invitedById: user.id,
          expiresAt: inviteExpiry(),
        },
      });
    }

    const sent = await sendInviteEmail({
      to: email,
      token: invite.token,
      courseTitle: course.title,
      mentorName: user.name ?? null,
    });
    if (!sent) emailFailed = true;
    invitedEmails.push(email);
  }

  return { ok: true, enrolledEmails, invitedEmails, emailFailed };
}

export type CreateInviteLinkResult =
  | { ok: true; token: string; url: string; reused: boolean }
  | { ok: false; errors: string[] };

/** Course-scoped open invite link — any signed-in account can self-enroll. */
export async function createInviteLink(input: {
  courseId: string;
}): Promise<CreateInviteLinkResult> {
  const user = await requireMentorOfCourse(input.courseId);

  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: { id: true, status: true, title: true },
  });
  if (!course) return { ok: false, errors: ["Course not found."] };
  if (course.status !== "PUBLISHED") {
    return { ok: false, errors: ["Publish the course before sharing an invite link."] };
  }

  const existing = await prisma.invite.findFirst({
    where: {
      courseId: course.id,
      email: null,
      acceptedAt: null,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return { ok: true, token: existing.token, url: inviteAcceptUrl(existing.token), reused: true };
  }

  const invite = await prisma.invite.create({
    data: {
      token: newInviteToken(),
      courseId: course.id,
      invitedById: user.id,
      expiresAt: inviteExpiry(),
    },
  });
  return { ok: true, token: invite.token, url: inviteAcceptUrl(invite.token), reused: false };
}

export async function revokeInvite(input: {
  inviteId: string;
  courseId: string;
}): Promise<InviteActionResult> {
  await requireMentorOfCourse(input.courseId);
  await prisma.invite.updateMany({
    where: { id: input.inviteId, courseId: input.courseId, acceptedAt: null },
    data: { revokedAt: new Date() },
  });
  return { ok: true };
}

export type AcceptInviteResult =
  | { ok: true; courseSlug: string }
  | {
      ok: false;
      error:
        | "invalid"
        | "revoked"
        | "expired"
        | "already-accepted"
        | "wrong-account"
        | "course-unavailable";
    };

/**
 * Signed-in mentee accepts an invite: creates the Enrollment (the same shape an
 * assignment produces) and marks the invite used. New accounts arrive here
 * straight from their first sign-in — Auth.js creates the User row when the
 * magic link / Google sign-in completes, so no separate signup route exists.
 */
export async function acceptInvite(input: {
  token: string;
  name?: string;
}): Promise<AcceptInviteResult> {
  const user = await requireUser();

  const invite = await prisma.invite.findUnique({
    where: { token: input.token },
    include: { course: { select: { id: true, slug: true, status: true } } },
  });
  if (!invite) return { ok: false, error: "invalid" };
  if (invite.revokedAt) return { ok: false, error: "revoked" };
  if (invite.acceptedAt) return { ok: false, error: "already-accepted" };
  if (invite.expiresAt && invite.expiresAt <= new Date()) return { ok: false, error: "expired" };
  if (invite.email && user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return { ok: false, error: "wrong-account" };
  }
  if (invite.course.status !== "PUBLISHED") return { ok: false, error: "course-unavailable" };

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.upsert({
      where: { courseId_userId: { courseId: invite.courseId, userId: user.id } },
      update: { status: "ASSIGNED" },
      create: { courseId: invite.courseId, userId: user.id, status: "ASSIGNED" },
    });
    await tx.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date(), acceptedById: user.id },
    });
    const name = input.name?.trim();
    if (name) {
      await tx.user.update({ where: { id: user.id }, data: { name } });
    }
  });

  return { ok: true, courseSlug: invite.course.slug };
}

/** Mentee declines without signing anything — the invite stays usable. */
export async function getPublicInviteView(token: string) {
  return prisma.invite.findUnique({
    where: { token },
    select: {
      id: true,
      email: true,
      acceptedAt: true,
      revokedAt: true,
      expiresAt: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          coverUrl: true,
          status: true,
          estimatedHours: true,
          mentor: { select: { name: true } },
        },
      },
    },
  });
}
