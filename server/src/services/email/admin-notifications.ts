
import { prisma } from "../../db/prisma.js";
import { escapeHtml, formatMessagePreview } from "./format.js";
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
    html: `<p>A learner requested instructor access on Buildment.</p>
<p><strong>${escapeHtml(applicant)}</strong> (${escapeHtml(request.user.email)})</p>
${preview ? `<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #6366f1;background:#f8fafc;">${escapeHtml(preview)}</blockquote>` : ""}
<p><a href="${url}">Review in the admin console</a></p>`,
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
    html: `<p>An organization requested access to allocate a course.</p>
<p><strong>${escapeHtml(request.organization.name)}</strong> (${escapeHtml(request.organization.slug)}) wants <strong>${escapeHtml(request.course.title)}</strong>.</p>
<p><a href="${url}">Review in the admin console</a></p>`,
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
      html: `<p>Hi ${escapeHtml(user.name ?? "there")},</p>
<p>Your request to teach on Buildment was <strong>approved</strong>. You can open the mentor workspace and create or manage courses.</p>
<p><a href="${url}">Open the teach workspace</a></p>`,
      text: `Your instructor access was approved. Open: ${url}`,
    });
    return;
  }

  await sendEmail({
    to: user.email,
    subject: "Instructor access update · Buildment",
    html: `<p>Hi ${escapeHtml(user.name ?? "there")},</p>
<p>Your request for instructor access was reviewed and was not approved at this time. You can keep learning as a mentee and submit a new request later if your plans change.</p>
<p><a href="${url}">Back to your dashboard</a></p>`,
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
    html: `<p>Hi ${escapeHtml(input.name ?? "there")},</p>
<p>A Buildment admin enabled instructor tools on your account. Sign in to open the teach workspace and publish courses.</p>
<p><a href="${url}">Sign in to Buildment</a></p>`,
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
    html: `<p>Hi ${escapeHtml(input.name ?? "there")},</p>
<p>A Buildment admin granted your account platform administrator access. You can now manage organizations, course requests and user access from the admin console.</p>
<p><a href="${url}">Open the admin console</a></p>`,
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
    html: `<p>Hi ${escapeHtml(request.course.mentor.name ?? "there")},</p>
<p><strong>${escapeHtml(request.organization.name)}</strong> can now allocate seats for your course <strong>${escapeHtml(request.course.title)}</strong>.</p>
<p>Learners from that organization may enroll through your integration settings.</p>`,
    text: `${request.organization.name} was approved to allocate "${request.course.title}".`,
  });
}
