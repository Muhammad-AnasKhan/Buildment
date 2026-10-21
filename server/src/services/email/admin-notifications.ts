import { renderEmailTemplate } from "./render.js";

import { prisma } from "../../db/prisma.js";
import { formatMessagePreview } from "./format.js";
import { listAdminNotificationEmails } from "./admin-recipients.js";
import { appBaseUrl, sendEmail } from "./send.js";

async function notifyEachAdmin(input: {
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const recipients = await listAdminNotificationEmails();
  if (recipients.length === 0) {
    console.info(`[email] No admin recipients — skipped: "${input.subject}"`);
    return;
  }
  await Promise.all(recipients.map((to) => sendEmail({ to, ...input })));
}

export async function notifyAdminsInstructorAccessRequest(requestId: string): Promise<void> {
  const request = await prisma.instructorAccessRequest.findUnique({
    where: { id: requestId },
    select: {
      message: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!request?.user.email) return;

  const applicant = request.user.name?.trim() || request.user.email;
  const preview = request.message ? formatMessagePreview(request.message, 400) : null;
  const url = `${appBaseUrl()}/admin/users`;

  await notifyEachAdmin({
    subject: `Instructor access request · ${applicant}`,
    html: await renderEmailTemplate("notify-admins-instructor-access-request", { applicant, email: request.user.email, preview, url }),
    text: `Instructor access request from ${applicant} (${request.user.email}).${preview ? `\n\n${preview}` : ""}\n\nReview: ${url}`,
  });
}

export async function notifyAdminsOrganizationCourseRequest(requestId: string): Promise<void> {
  const request = await prisma.organizationCourseRequest.findUnique({
    where: { id: requestId },
    select: {
      organization: { select: { name: true, slug: true } },
      course: { select: { title: true } },
    },
  });
  if (!request) return;

  const url = `${appBaseUrl()}/admin/requests`;

  await notifyEachAdmin({
    subject: `Org course allocation request · ${request.organization.name}`,
    html: await renderEmailTemplate("notify-admins-organization-course-request", { organizationName: request.organization.name, organizationSlug: request.organization.slug, courseTitle: request.course.title, url: url }),
    text: `${request.organization.name} requested course "${request.course.title}". Review: ${url}`,
  });
}

export async function notifyUserInstructorAccessDecision(input: {
  userId: string;
  approved: boolean;
}): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { email: true, name: true },
  });
  if (!user?.email) return;

  const url = `${appBaseUrl()}${input.approved ? "/teach" : "/dashboard"}`;

  if (input.approved) {
    await sendEmail({
      to: user.email,
      subject: "Instructor access approved · Buildment",
      html: await renderEmailTemplate("notify-user-instructor-access-decision-approved", { name: user.name ?? "there", url: url }),
      text: `Your instructor access was approved. Open: ${url}`,
    });
    return;
  }

  await sendEmail({
    to: user.email,
    subject: "Instructor access update · Buildment",
    html: await renderEmailTemplate("notify-user-instructor-access-decision-declined", { name: user.name ?? "there", url: url }),
    text: `Your instructor access request was not approved. Dashboard: ${url}`,
  });
}

export async function notifyUserGrantedInstructorByAdmin(input: {
  email: string;
  name: string | null;
}): Promise<void> {
  const url = `${appBaseUrl()}/login`;

  await sendEmail({
    to: input.email,
    subject: "You have instructor access · Buildment",
    html: await renderEmailTemplate("notify-user-granted-instructor-by-admin", { name: input.name ?? "there", url: url }),
    text: `You have instructor access on Buildment. Sign in: ${url}`,
  });
}

export async function notifyUserGrantedAdminByAdmin(input: {
  email: string;
  name: string | null;
}): Promise<void> {
  const url = `${appBaseUrl()}/admin`;

  await sendEmail({
    to: input.email,
    subject: "You are now a platform admin · Buildment",
    html: await renderEmailTemplate("notify-user-granted-admin-by-admin", { name: input.name ?? "there", url: url }),
    text: `You are now a platform admin on Buildment. Open: ${url}`,
  });
}

export async function notifyMentorOrganizationCourseApproved(requestId: string): Promise<void> {
  const request = await prisma.organizationCourseRequest.findUnique({
    where: { id: requestId },
    select: {
      organization: { select: { name: true } },
      course: {
        select: {
          title: true,
          mentor: { select: { email: true, name: true } },
        },
      },
    },
  });
  const mentorEmail = request?.course.mentor.email;
  if (!request || !mentorEmail) return;

  await sendEmail({
    to: mentorEmail,
    subject: `Organization approved for ${request.course.title}`,
    html: await renderEmailTemplate("notify-mentor-organization-course-approved", { name: request.course.mentor.name ?? "there", organizationName: request.organization.name, courseTitle: request.course.title }),
    text: `${request.organization.name} was approved to allocate "${request.course.title}".`,
  });
}
