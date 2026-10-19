import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import { appBaseUrl } from "../email/send.js";
import { escapeHtml, formatMessagePreview } from "../email/format.js";
import { listAdminRecipients } from "../email/admin-recipients.js";
import { notify, type NotificationRecipient } from "./service.js";
import { loadSuggestableCourses, rankCourseSuggestions } from "./course-suggestions.js";

// Product events → notify(). Each builder loads what the message needs, names the event with a
// dedupe key, and describes it once for the bell and once for email; channels and preferences are
// applied centrally. Call sites run these after their own write commits, through
// dispatchNotification(), so a notification problem never fails the user's action.

const hi = (name: string | null) => `<p>Hi ${escapeHtml(name ?? "there")},</p>`;
const quote = (text: string, color = "#6366f1", background = "#f8fafc") =>
  `<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid ${color};background:${background};color:#0f172a;">${escapeHtml(text)}</blockquote>`;

function chapterLabel(title: string | null | undefined): string {
  return title?.trim() ? title : "this lesson";
}

// --- Help questions ---------------------------------------------------------------------------

/** The course mentor hears about each message a mentee posts on a help thread. */
export async function notifyMentorHelpQuestion(input: {
  threadId: string;
  messageId: string;
  body: string;
  menteeName: string | null;
}): Promise<void> {
  const thread = await prisma.helpThread.findUnique({
    where: { id: input.threadId },
    select: {
      id: true,
      courseId: true,
      course: { select: { title: true, mentorId: true } },
      chapter: { select: { title: true } },
    },
  });
  if (!thread) return;

  const menteeLabel = input.menteeName?.trim() || "A learner";
  const courseTitle = thread.course.title;
  const lesson = chapterLabel(thread.chapter?.title);
  const preview = formatMessagePreview(input.body);
  const path = `/help/${thread.id}`;

  await notify({
    type: "help.question",
    recipients: [{ userId: thread.course.mentorId }],
    dedupeKey: `help-message:${input.messageId}`,
    title: `${menteeLabel} asked a question`,
    body: `${courseTitle} · ${lesson}: ${formatMessagePreview(input.body, 140)}`,
    url: path,
    courseId: thread.courseId,
    email: ({ name }) => ({
      subject: `${menteeLabel} asked a question · ${courseTitle}`,
      html: `${hi(name)}
<p><strong>${escapeHtml(menteeLabel)}</strong> posted a question in <strong>${escapeHtml(courseTitle)}</strong> (${escapeHtml(lesson)}):</p>
${quote(preview)}
<p><a href="${appBaseUrl()}${path}">Open the conversation in Buildment</a></p>`,
      text: `${menteeLabel} asked a question in ${courseTitle} (${lesson}):\n\n${preview}\n\nReply: ${appBaseUrl()}${path}`,
    }),
  });
}

/** The mentee hears when their mentor replies on a help thread. */
export async function notifyMenteeHelpReply(input: {
  threadId: string;
  messageId: string;
  body: string;
  mentorName: string | null;
}): Promise<void> {
  const thread = await prisma.helpThread.findUnique({
    where: { id: input.threadId },
    select: {
      id: true,
      courseId: true,
      menteeId: true,
      course: { select: { title: true } },
      chapter: { select: { title: true } },
    },
  });
  if (!thread) return;

  const mentorLabel = input.mentorName?.trim() || "Your mentor";
  const courseTitle = thread.course.title;
  const lesson = chapterLabel(thread.chapter?.title);
  const preview = formatMessagePreview(input.body);
  const path = `/my-questions/${thread.id}`;

  await notify({
    type: "help.reply",
    recipients: [{ userId: thread.menteeId }],
    dedupeKey: `help-message:${input.messageId}`,
    title: `${mentorLabel} replied to your question`,
    body: `${courseTitle} · ${lesson}: ${formatMessagePreview(input.body, 140)}`,
    url: path,
    courseId: thread.courseId,
    email: ({ name }) => ({
      subject: `${mentorLabel} replied · ${courseTitle}`,
      html: `${hi(name)}
<p><strong>${escapeHtml(mentorLabel)}</strong> replied to your question in <strong>${escapeHtml(courseTitle)}</strong> (${escapeHtml(lesson)}):</p>
${quote(preview, "#10b981", "#f0fdf4")}
<p><a href="${appBaseUrl()}${path}">Read the full reply in Buildment</a></p>`,
      text: `${mentorLabel} replied in ${courseTitle} (${lesson}):\n\n${preview}\n\nView: ${appBaseUrl()}${path}`,
    }),
  });
}

export async function notifyMenteeHelpThreadResolved(threadId: string): Promise<void> {
  const thread = await prisma.helpThread.findUnique({
    where: { id: threadId },
    select: {
      courseId: true,
      menteeId: true,
      course: { select: { title: true, slug: true } },
      chapter: { select: { title: true, slug: true } },
    },
  });
  if (!thread) return;

  const lesson = chapterLabel(thread.chapter?.title);
  const path =
    thread.chapter?.slug != null ? `/courses/${thread.course.slug}/${thread.chapter.slug}` : `/my-questions/${threadId}`;

  await notify({
    type: "help.resolved",
    recipients: [{ userId: thread.menteeId }],
    dedupeKey: `help-resolved:${threadId}`,
    title: "Your question was resolved",
    body: `${thread.course.title} · ${lesson}`,
    url: path,
    courseId: thread.courseId,
    email: ({ name }) => ({
      subject: `Question resolved · ${thread.course.title}`,
      html: `${hi(name)}
<p>Your mentor marked your help question as resolved in <strong>${escapeHtml(thread.course.title)}</strong> (${escapeHtml(lesson)}).</p>
<p><a href="${appBaseUrl()}${path}">Open the lesson in Buildment</a></p>`,
      text: `Your help question was resolved in ${thread.course.title} (${lesson}). Open: ${appBaseUrl()}${path}`,
    }),
  });
}

// --- Reviews ----------------------------------------------------------------------------------

/** The mentor hears that a submission needs human review (open questions, etc.). */
export async function notifyMentorPendingReview(responseId: string): Promise<void> {
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    select: {
      user: { select: { name: true, email: true } },
      block: {
        select: {
          chapter: {
            select: { title: true, courseId: true, course: { select: { title: true, mentorId: true } } },
          },
        },
      },
    },
  });
  if (!response) return;

  const learnerLabel = response.user.name?.trim() || response.user.email || "A learner";
  const { chapter } = response.block;
  const courseTitle = chapter.course.title;
  const lesson = chapterLabel(chapter.title);
  const path = `/review/${responseId}`;

  await notify({
    type: "review.pending",
    recipients: [{ userId: chapter.course.mentorId }],
    dedupeKey: `review-pending:${responseId}`,
    title: "Submission to review",
    body: `${learnerLabel} · ${courseTitle} · ${lesson}`,
    url: path,
    courseId: chapter.courseId,
    email: ({ name }) => ({
      subject: `Submission to review · ${courseTitle}`,
      html: `${hi(name)}
<p><strong>${escapeHtml(learnerLabel)}</strong> submitted work for review in <strong>${escapeHtml(courseTitle)}</strong> (${escapeHtml(lesson)}).</p>
<p><a href="${appBaseUrl()}${path}">Open the review queue</a></p>`,
      text: `${learnerLabel} submitted work for review in ${courseTitle} (${lesson}). Review: ${appBaseUrl()}${path}`,
    }),
  });
}

/** The mentee hears after a mentor publishes review feedback. */
export async function notifyMenteeReviewFeedback(input: {
  responseId: string;
  verdict: "APPROVED" | "NEEDS_REVISION";
  feedbackPreview: string;
}): Promise<void> {
  const response = await prisma.response.findUnique({
    where: { id: input.responseId },
    select: {
      userId: true,
      block: {
        select: {
          chapter: { select: { title: true, slug: true, courseId: true, course: { select: { title: true, slug: true } } } },
        },
      },
    },
  });
  if (!response) return;

  const { chapter } = response.block;
  const courseTitle = chapter.course.title;
  const lesson = chapterLabel(chapter.title);
  const path = `/courses/${chapter.course.slug}/${chapter.slug}`;
  const approved = input.verdict === "APPROVED";
  const verdictLabel = approved ? "approved your submission" : "asked for a revision";
  const preview = formatMessagePreview(input.feedbackPreview, 400);

  await notify({
    type: "review.feedback",
    recipients: [{ userId: response.userId }],
    dedupeKey: `review-feedback:${input.responseId}`,
    title: approved ? "Your mentor approved your submission" : "Your mentor asked for a revision",
    body: `${courseTitle} · ${lesson}: ${formatMessagePreview(input.feedbackPreview, 140)}`,
    url: path,
    courseId: chapter.courseId,
    email: ({ name }) => ({
      subject: approved ? `Mentor feedback · ${courseTitle}` : `Revision requested · ${courseTitle}`,
      html: `${hi(name)}
<p>Your mentor <strong>${escapeHtml(verdictLabel)}</strong> in <strong>${escapeHtml(courseTitle)}</strong> (${escapeHtml(lesson)}).</p>
${quote(preview)}
<p><a href="${appBaseUrl()}${path}">Open the lesson in Buildment</a></p>`,
      text: `Your mentor ${verdictLabel} in ${courseTitle} (${lesson}):\n\n${preview}\n\nLesson: ${appBaseUrl()}${path}`,
    }),
  });
}

// --- Enrollment and completion ----------------------------------------------------------------

/** The learner hears they were enrolled. Learners without an account yet get the email only. */
export async function notifyMenteeCourseEnrollment(enrollmentId: string): Promise<void> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      courseId: true,
      userId: true,
      learnerProfile: { select: { email: true } },
      course: { select: { title: true, slug: true, mentor: { select: { name: true } } } },
    },
  });
  if (!enrollment) return;

  const recipient: NotificationRecipient | null = enrollment.userId
    ? { userId: enrollment.userId }
    : enrollment.learnerProfile?.email
      ? { email: enrollment.learnerProfile.email }
      : null;
  if (!recipient) return;

  const mentorLabel = enrollment.course.mentor.name?.trim() || "Your mentor";
  const path = `/courses/${enrollment.course.slug}`;

  await notify({
    type: "enrollment.created",
    recipients: [recipient],
    dedupeKey: `enrolled:${enrollmentId}`,
    title: `You're enrolled in ${enrollment.course.title}`,
    body: `${mentorLabel} added you to this course. Start whenever you're ready.`,
    url: path,
    courseId: enrollment.courseId,
    email: ({ name }) => ({
      subject: `You're enrolled in ${enrollment.course.title}`,
      html: `${hi(name)}
<p><strong>${escapeHtml(mentorLabel)}</strong> added you to <strong>${escapeHtml(enrollment.course.title)}</strong> on Buildment.</p>
<p><a href="${appBaseUrl()}${path}">Start the course</a></p>`,
      text: `You're enrolled in ${enrollment.course.title}. Start: ${appBaseUrl()}${path}`,
    }),
  });
}

export async function notifyMentorNewEnrollment(enrollmentId: string): Promise<void> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      courseId: true,
      user: { select: { name: true, email: true } },
      learnerProfile: { select: { email: true } },
      course: { select: { title: true, slug: true, mentorId: true } },
    },
  });
  if (!enrollment) return;

  const learnerLabel =
    enrollment.user?.name?.trim() || enrollment.user?.email || enrollment.learnerProfile?.email || "A learner";
  const path = `/courses/${enrollment.course.slug}/mentees`;

  await notify({
    type: "enrollment.new_learner",
    recipients: [{ userId: enrollment.course.mentorId }],
    dedupeKey: `new-learner:${enrollmentId}`,
    title: "New learner",
    body: `${learnerLabel} enrolled in ${enrollment.course.title}.`,
    url: path,
    courseId: enrollment.courseId,
    email: ({ name }) => ({
      subject: `New learner · ${enrollment.course.title}`,
      html: `${hi(name)}
<p><strong>${escapeHtml(learnerLabel)}</strong> is now enrolled in <strong>${escapeHtml(enrollment.course.title)}</strong>.</p>
<p><a href="${appBaseUrl()}${path}">See your learners</a></p>`,
      text: `${learnerLabel} enrolled in ${enrollment.course.title}. Learners: ${appBaseUrl()}${path}`,
    }),
  });
}

/**
 * The learner (and, in-app, the mentor) hear that a course was finished. Runs inside the
 * transaction that marks the enrollment COMPLETED, so the notification commits with the completion
 * and the worker pushes it live right after. The dedupe key keeps it to once per enrollment even if
 * new chapters later reopen and re-complete the course.
 *
 * The learner's message points at what to do next: another course they are already taking (most
 * recently studied first), otherwise a catalog course to start (course-suggestions.ts).
 */
export async function notifyCourseCompleted(tx: Prisma.TransactionClient, enrollmentId: string): Promise<void> {
  const enrollment = await tx.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      courseId: true,
      userId: true,
      user: { select: { name: true, email: true } },
      course: { select: { title: true, slug: true, mentorId: true } },
    },
  });
  if (!enrollment?.userId) return;
  const { course } = enrollment;
  const next = await nextCourseAfterCompletion(tx, enrollment.userId, enrollment.courseId, course.mentorId);

  await notify(
    {
      type: "course.completed",
      recipients: [{ userId: enrollment.userId }],
      dedupeKey: `course-completed:${enrollmentId}`,
      title: `You finished ${course.title}`,
      body: next ? `Every chapter is complete. Well done! ${next.lead}` : "Every chapter is complete. Well done!",
      url: next?.url ?? `/courses/${course.slug}`,
      courseId: enrollment.courseId,
      data: next ? { nextCourseId: next.courseId } : undefined,
      email: ({ name }) => ({
        subject: `Course complete · ${course.title}`,
        html: `${hi(name)}
<p>You completed every chapter of <strong>${escapeHtml(course.title)}</strong>. Well done!</p>
${next ? `<p>${escapeHtml(next.lead)} <a href="${appBaseUrl()}${next.url}">${escapeHtml(next.action)}</a></p>` : ""}
<p><a href="${appBaseUrl()}/courses/${course.slug}">Look back at the course</a></p>`,
        text: `You completed ${course.title}.${next ? ` ${next.lead} ${appBaseUrl()}${next.url}` : ""} Course: ${appBaseUrl()}/courses/${course.slug}`,
      }),
    },
    { tx }
  );

  if (course.mentorId === enrollment.userId) return;
  const learnerLabel = enrollment.user?.name?.trim() || enrollment.user?.email || "A learner";
  await notify(
    {
      type: "course.learner_completed",
      recipients: [{ userId: course.mentorId }],
      dedupeKey: `learner-completed:${enrollmentId}`,
      title: "A learner finished your course",
      body: `${learnerLabel} completed ${course.title}.`,
      url: `/courses/${course.slug}/mentees`,
      courseId: enrollment.courseId,
    },
    { tx }
  );
}

type NextCourse = { courseId: string; url: string; lead: string; action: string };

/** Where a learner who just finished a course should go next, or null when there is nowhere. */
async function nextCourseAfterCompletion(
  tx: Prisma.TransactionClient,
  userId: string,
  finishedCourseId: string,
  finishedMentorId: string
): Promise<NextCourse | null> {
  const enrollments = await tx.enrollment.findMany({
    where: { userId },
    select: {
      courseId: true,
      status: true,
      lifecycle: true,
      lastActiveAt: true,
      createdAt: true,
      course: { select: { title: true, slug: true, status: true } },
    },
  });

  const inProgress = enrollments
    .filter(
      (row) =>
        row.courseId !== finishedCourseId &&
        row.lifecycle === "ACTIVE" &&
        (row.status === "ASSIGNED" || row.status === "IN_PROGRESS") &&
        row.course.status === "PUBLISHED"
    )
    .sort((a, b) => (b.lastActiveAt ?? b.createdAt).getTime() - (a.lastActiveAt ?? a.createdAt).getTime());
  const current = inProgress[0];
  if (current) {
    const started = current.lastActiveAt !== null;
    return {
      courseId: current.courseId,
      url: `/courses/${current.course.slug}`,
      lead: started ? `Pick up ${current.course.title} next.` : `${current.course.title} is waiting for you next.`,
      action: started ? `Continue ${current.course.title}` : `Start ${current.course.title}`,
    };
  }

  const [suggestion] = rankCourseSuggestions(await loadSuggestableCourses(tx), {
    excludeCourseIds: enrollments.map((row) => row.courseId),
    preferMentorId: finishedMentorId,
  });
  if (!suggestion) return null;
  return {
    courseId: suggestion.id,
    url: `/catalog/${suggestion.slug}`,
    lead: `Ready for what's next? Try ${suggestion.title}.`,
    action: `See ${suggestion.title}`,
  };
}

// --- Account and admin ------------------------------------------------------------------------

/** Every ADMIN account in-app and by email, plus ADMIN_NOTIFY_EMAIL inboxes by email. */
async function adminRecipients(): Promise<NotificationRecipient[]> {
  const { userIds, extraEmails } = await listAdminRecipients();
  return [...userIds.map((userId) => ({ userId })), ...extraEmails.map((email) => ({ email }))];
}

export async function notifyAdminsInstructorAccessRequest(requestId: string): Promise<void> {
  const request = await prisma.instructorAccessRequest.findUnique({
    where: { id: requestId },
    select: { message: true, updatedAt: true, user: { select: { name: true, email: true } } },
  });
  if (!request?.user.email) return;

  const applicant = request.user.name?.trim() || request.user.email;
  const preview = request.message ? formatMessagePreview(request.message, 400) : null;
  const path = "/admin/users";

  await notify({
    type: "instructor.request",
    recipients: await adminRecipients(),
    dedupeKey: `instructor-request:${requestId}:${request.updatedAt.getTime()}`,
    title: "Instructor access request",
    body: `${applicant} asked for instructor tools.`,
    url: path,
    email: () => ({
      subject: `Instructor access request · ${applicant}`,
      html: `<p>A learner requested instructor access on Buildment.</p>
<p><strong>${escapeHtml(applicant)}</strong> (${escapeHtml(request.user.email)})</p>
${preview ? quote(preview) : ""}
<p><a href="${appBaseUrl()}${path}">Review in the admin console</a></p>`,
      text: `Instructor access request from ${applicant} (${request.user.email}).${preview ? `\n\n${preview}` : ""}\n\nReview: ${appBaseUrl()}${path}`,
    }),
  });
}

export async function notifyAdminsOrganizationCourseRequest(requestId: string): Promise<void> {
  const request = await prisma.organizationCourseRequest.findUnique({
    where: { id: requestId },
    select: {
      courseId: true,
      organization: { select: { name: true, slug: true } },
      course: { select: { title: true } },
    },
  });
  if (!request) return;

  const path = "/admin/requests";

  await notify({
    type: "organization.course_request",
    recipients: await adminRecipients(),
    dedupeKey: `org-course-request:${requestId}`,
    title: "Organization course request",
    body: `${request.organization.name} wants to allocate ${request.course.title}.`,
    url: path,
    courseId: request.courseId,
    email: () => ({
      subject: `Org course allocation request · ${request.organization.name}`,
      html: `<p>An organization requested access to allocate a course.</p>
<p><strong>${escapeHtml(request.organization.name)}</strong> (${escapeHtml(request.organization.slug)}) wants <strong>${escapeHtml(request.course.title)}</strong>.</p>
<p><a href="${appBaseUrl()}${path}">Review in the admin console</a></p>`,
      text: `${request.organization.name} requested course "${request.course.title}". Review: ${appBaseUrl()}${path}`,
    }),
  });
}

export async function notifyUserInstructorAccessDecision(input: { userId: string; approved: boolean }): Promise<void> {
  const request = await prisma.instructorAccessRequest.findUnique({
    where: { userId: input.userId },
    select: { id: true, reviewedAt: true },
  });
  const reviewedAt = request?.reviewedAt?.getTime() ?? Date.now();
  const path = input.approved ? "/workspace" : "/dashboard";

  await notify({
    type: "instructor.decision",
    recipients: [{ userId: input.userId }],
    dedupeKey: `instructor-decision:${request?.id ?? input.userId}:${reviewedAt}`,
    title: input.approved ? "Instructor access approved" : "Instructor access update",
    body: input.approved
      ? "You can now open the mentor workspace and create courses."
      : "Your request was not approved this time. You can keep learning and ask again later.",
    url: path,
    email: ({ name }) =>
      input.approved
        ? {
            subject: "Instructor access approved · Buildment",
            html: `${hi(name)}
<p>Your request to teach on Buildment was <strong>approved</strong>. You can open the mentor workspace and create or manage courses.</p>
<p><a href="${appBaseUrl()}${path}">Open the teach workspace</a></p>`,
            text: `Your instructor access was approved. Open: ${appBaseUrl()}${path}`,
          }
        : {
            subject: "Instructor access update · Buildment",
            html: `${hi(name)}
<p>Your request for instructor access was reviewed and was not approved at this time. You can keep learning as a mentee and submit a new request later if your plans change.</p>
<p><a href="${appBaseUrl()}${path}">Back to your dashboard</a></p>`,
            text: `Your instructor access request was not approved. Dashboard: ${appBaseUrl()}${path}`,
          },
  });
}

export async function notifyUserGrantedInstructorByAdmin(input: { userId: string; grantedAt: Date }): Promise<void> {
  const path = "/login";
  await notify({
    type: "instructor.granted",
    recipients: [{ userId: input.userId }],
    dedupeKey: `instructor-granted:${input.userId}:${input.grantedAt.getTime()}`,
    title: "You have instructor access",
    body: "A Buildment admin enabled instructor tools on your account.",
    url: "/workspace",
    email: ({ name }) => ({
      subject: "You have instructor access · Buildment",
      html: `${hi(name)}
<p>A Buildment admin enabled instructor tools on your account. Sign in to open the teach workspace and publish courses.</p>
<p><a href="${appBaseUrl()}${path}">Sign in to Buildment</a></p>`,
      text: `You have instructor access on Buildment. Sign in: ${appBaseUrl()}${path}`,
    }),
  });
}

export async function notifyMentorOrganizationCourseApproved(requestId: string): Promise<void> {
  const request = await prisma.organizationCourseRequest.findUnique({
    where: { id: requestId },
    select: {
      courseId: true,
      organization: { select: { name: true } },
      course: { select: { title: true, slug: true, mentorId: true } },
    },
  });
  if (!request) return;

  await notify({
    type: "organization.course_approved",
    recipients: [{ userId: request.course.mentorId }],
    dedupeKey: `org-course-approved:${requestId}`,
    title: `Organization approved for ${request.course.title}`,
    body: `${request.organization.name} can now allocate seats for this course.`,
    url: `/courses/${request.course.slug}/mentees`,
    courseId: request.courseId,
    email: ({ name }) => ({
      subject: `Organization approved for ${request.course.title}`,
      html: `${hi(name)}
<p><strong>${escapeHtml(request.organization.name)}</strong> can now allocate seats for your course <strong>${escapeHtml(request.course.title)}</strong>.</p>
<p>Learners from that organization may enroll through your integration settings.</p>`,
      text: `${request.organization.name} was approved to allocate "${request.course.title}".`,
    }),
  });
}
