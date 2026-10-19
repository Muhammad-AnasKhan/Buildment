import type { AdminUsersView } from "../../shared/api/admin.js";
import { ADMIN_ERROR_CODES } from "../../shared/api/admin.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import type { GrantInstructorBody } from "../../validations/admin.js";
import { notifyUserGrantedInstructorByAdmin, notifyUserInstructorAccessDecision } from "../email/admin-notifications.js";
import { queueEmail } from "../email/queue.js";

// Accounts and the instructor capability. Granting instructor tools promotes a
// learner to MENTOR (admins keep their role) and records an approved request so
// the learner-side status reads consistently.

const USER_LIST_LIMIT = 100;

export async function listUsers(): Promise<AdminUsersView> {
  const [pendingInstructorRequests, users] = await Promise.all([
    prisma.instructorAccessRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, message: true, user: { select: { id: true, email: true, name: true, role: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: USER_LIST_LIMIT,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { enrollments: true, coursesOwned: true } },
      },
    }),
  ]);

  return {
    pendingInstructorRequests,
    users: users.map(({ _count, emailVerified, createdAt, ...user }) => ({
      ...user,
      emailVerified: emailVerified !== null,
      createdAt: createdAt.toISOString(),
      enrollmentCount: _count.enrollments,
      courseCount: _count.coursesOwned,
    })),
  };
}

export async function setInstructorAccess(userId: string, enabled: boolean): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!existing) throw new NotFoundError("User not found");

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role: existing.role === "ADMIN" ? "ADMIN" : enabled ? "MENTOR" : "MENTEE" },
    });
    if (enabled) {
      await tx.instructorAccessRequest.upsert({
        where: { userId },
        create: { userId, status: "APPROVED", reviewedAt: new Date() },
        update: { status: "APPROVED", reviewedAt: new Date() },
      });
    }
  });
}

/** Grants instructor tools by email, creating a verified account when the address is new. */
export async function grantInstructorByEmail(input: GrantInstructorBody): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { role: true } });
  const user = await prisma.user.upsert({
    where: { email: input.email },
    create: {
      email: input.email,
      name: input.name ?? input.email.split("@")[0],
      role: "MENTOR",
      emailVerified: new Date(),
    },
    update: { ...(existing?.role === "ADMIN" ? {} : { role: "MENTOR" }) },
    select: { id: true, name: true },
  });

  await prisma.instructorAccessRequest.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status: "APPROVED", reviewedAt: new Date() },
    update: { status: "APPROVED", reviewedAt: new Date() },
  });

  queueEmail(() => notifyUserGrantedInstructorByAdmin({ email: input.email, name: user.name ?? input.name ?? null }));
}

async function requirePendingInstructorRequest(requestId: string) {
  const request = await prisma.instructorAccessRequest.findUnique({
    where: { id: requestId },
    select: { id: true, userId: true, status: true, user: { select: { role: true } } },
  });
  if (!request) throw new NotFoundError("Request not found");
  if (request.status !== "PENDING") throw new ConflictError("This request has already been reviewed.", ADMIN_ERROR_CODES.REQUEST_ALREADY_REVIEWED);
  return request;
}

export async function approveInstructorRequest(admin: { id: string }, requestId: string): Promise<void> {
  const request = await requirePendingInstructorRequest(requestId);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: request.userId },
      data: { ...(request.user.role !== "ADMIN" ? { role: "MENTOR" } : {}) },
    }),
    prisma.instructorAccessRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED", reviewedById: admin.id, reviewedAt: new Date() },
    }),
  ]);
  queueEmail(() => notifyUserInstructorAccessDecision({ userId: request.userId, approved: true }));
}

export async function rejectInstructorRequest(admin: { id: string }, requestId: string): Promise<void> {
  const request = await requirePendingInstructorRequest(requestId);
  await prisma.instructorAccessRequest.update({
    where: { id: request.id },
    data: { status: "REJECTED", reviewedById: admin.id, reviewedAt: new Date() },
  });
  queueEmail(() => notifyUserInstructorAccessDecision({ userId: request.userId, approved: false }));
}
