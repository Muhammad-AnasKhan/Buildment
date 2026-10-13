
import { prisma } from "../../db/prisma.js";
import { appBaseUrl, sendEmail } from "./send.js";
import { escapeHtml, formatMessagePreview } from "./format.js";

function chapterLabel(title: string | null | undefined): string {
  return title?.trim() ? title : "this lesson";
}

/** Notify the course mentor when a mentee posts on a help thread. */
export async function notifyMentorHelpQuestion(input: {
  threadId: string;
  body: string;
  menteeName: string | null;
}): Promise<void> {
  const thread = await prisma.helpThread.findUnique({
    where: { id: input.threadId },
    select: {
      id: true,
      course: {
        select: {
          title: true,
          mentor: { select: { email: true, name: true } },
        },
      },
      chapter: { select: { title: true } },
    },
  });
  const mentorEmail = thread?.course.mentor.email;
  if (!thread || !mentorEmail) return;

  const menteeLabel = input.menteeName?.trim() || "A learner";
  const courseTitle = thread.course.title;
  const lesson = chapterLabel(thread.chapter?.title);
  const preview = formatMessagePreview(input.body);
  const url = `${appBaseUrl()}/help/${thread.id}`;

  await sendEmail({
    to: mentorEmail,
    subject: `${menteeLabel} asked a question · ${courseTitle}`,
    html: `<p>Hi ${escapeHtml(thread.course.mentor.name ?? "there")},</p>
<p><strong>${escapeHtml(menteeLabel)}</strong> posted a question in <strong>${escapeHtml(courseTitle)}</strong> (${escapeHtml(lesson)}):</p>
<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #6366f1;background:#f8fafc;color:#0f172a;">${escapeHtml(preview)}</blockquote>
<p><a href="${url}">Open the conversation in Buildment</a></p>`,
    text: `${menteeLabel} asked a question in ${courseTitle} (${lesson}):\n\n${preview}\n\nReply: ${url}`,
  });
}

/** Notify the mentee when their mentor replies on a help thread. */
export async function notifyMenteeHelpReply(input: {
  threadId: string;
  body: string;
  mentorName: string | null;
}): Promise<void> {
  const thread = await prisma.helpThread.findUnique({
    where: { id: input.threadId },
    select: {
      id: true,
      mentee: { select: { email: true, name: true } },
      course: { select: { title: true } },
      chapter: { select: { title: true } },
    },
  });
  const menteeEmail = thread?.mentee.email;
  if (!thread || !menteeEmail) return;

  const mentorLabel = input.mentorName?.trim() || "Your mentor";
  const courseTitle = thread.course.title;
  const lesson = chapterLabel(thread.chapter?.title);
  const preview = formatMessagePreview(input.body);
  const url = `${appBaseUrl()}/my-questions/${thread.id}`;

  await sendEmail({
    to: menteeEmail,
    subject: `${mentorLabel} replied · ${courseTitle}`,
    html: `<p>Hi ${escapeHtml(thread.mentee.name ?? "there")},</p>
<p><strong>${escapeHtml(mentorLabel)}</strong> replied to your question in <strong>${escapeHtml(courseTitle)}</strong> (${escapeHtml(lesson)}):</p>
<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #10b981;background:#f0fdf4;color:#0f172a;">${escapeHtml(preview)}</blockquote>
<p><a href="${url}">Read the full reply in Buildment</a></p>`,
    text: `${mentorLabel} replied in ${courseTitle} (${lesson}):\n\n${preview}\n\nView: ${url}`,
  });
}

/** Notify the mentor that a submission needs human review (open questions, etc.). */
export async function notifyMentorPendingReview(responseId: string): Promise<void> {
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    select: {
      attempt: true,
      user: { select: { name: true, email: true } },
      block: {
        select: {
          type: true,
          chapter: {
            select: {
              title: true,
              slug: true,
              course: {
                select: {
                  title: true,
                  slug: true,
                  mentor: { select: { email: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  const mentorEmail = response?.block.chapter.course.mentor.email;
  if (!response || !mentorEmail) return;

  const learnerLabel = response.user.name?.trim() || response.user.email || "A learner";
  const courseTitle = response.block.chapter.course.title;
  const lesson = chapterLabel(response.block.chapter.title);
  const url = `${appBaseUrl()}/review/${responseId}`;

  await sendEmail({
    to: mentorEmail,
    subject: `Submission to review · ${courseTitle}`,
    html: `<p>Hi ${escapeHtml(response.block.chapter.course.mentor.name ?? "there")},</p>
<p><strong>${escapeHtml(learnerLabel)}</strong> submitted work for review in <strong>${escapeHtml(courseTitle)}</strong> (${escapeHtml(lesson)}).</p>
<p><a href="${url}">Open the review queue</a></p>`,
    text: `${learnerLabel} submitted work for review in ${courseTitle} (${lesson}). Review: ${url}`,
  });
}

/** Notify the mentee after a mentor publishes review feedback. */
export async function notifyMenteeReviewFeedback(input: {
  responseId: string;
  verdict: "APPROVED" | "NEEDS_REVISION";
  feedbackPreview: string;
}): Promise<void> {
  const response = await prisma.response.findUnique({
    where: { id: input.responseId },
    select: {
      user: { select: { email: true, name: true } },
      block: {
        select: {
          chapter: {
            select: {
              title: true,
              slug: true,
              course: { select: { title: true, slug: true } },
            },
          },
        },
      },
    },
  });
  const menteeEmail = response?.user.email;
  if (!response || !menteeEmail) return;

  const courseTitle = response.block.chapter.course.title;
  const lesson = chapterLabel(response.block.chapter.title);
  const { slug: courseSlug } = response.block.chapter.course;
  const { slug: chapterSlug } = response.block.chapter;
  const url = `${appBaseUrl()}/courses/${courseSlug}/${chapterSlug}`;
  const verdictLabel =
    input.verdict === "APPROVED" ? "approved your submission" : "asked for a revision";
  const preview = formatMessagePreview(input.feedbackPreview, 400);

  await sendEmail({
    to: menteeEmail,
    subject:
      input.verdict === "APPROVED"
        ? `Mentor feedback · ${courseTitle}`
        : `Revision requested · ${courseTitle}`,
    html: `<p>Hi ${escapeHtml(response.user.name ?? "there")},</p>
<p>Your mentor <strong>${escapeHtml(verdictLabel)}</strong> in <strong>${escapeHtml(courseTitle)}</strong> (${escapeHtml(lesson)}).</p>
<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #6366f1;background:#f8fafc;color:#0f172a;">${escapeHtml(preview)}</blockquote>
<p><a href="${url}">Open the lesson in Buildment</a></p>`,
    text: `Your mentor ${verdictLabel} in ${courseTitle} (${lesson}):\n\n${preview}\n\nLesson: ${url}`,
  });
}

export async function notifyMenteeHelpThreadResolved(threadId: string): Promise<void> {
  const thread = await prisma.helpThread.findUnique({
    where: { id: threadId },
    select: {
      mentee: { select: { email: true, name: true } },
      course: { select: { title: true, slug: true } },
      chapter: { select: { title: true, slug: true } },
    },
  });
  const menteeEmail = thread?.mentee.email;
  if (!thread || !menteeEmail) return;

  const lesson = chapterLabel(thread.chapter?.title);
  const chapterUrl =
    thread.chapter?.slug != null
      ? `${appBaseUrl()}/courses/${thread.course.slug}/${thread.chapter.slug}`
      : `${appBaseUrl()}/my-questions/${threadId}`;

  await sendEmail({
    to: menteeEmail,
    subject: `Question resolved · ${thread.course.title}`,
    html: `<p>Hi ${escapeHtml(thread.mentee.name ?? "there")},</p>
<p>Your mentor marked your help question as resolved in <strong>${escapeHtml(thread.course.title)}</strong> (${escapeHtml(lesson)}).</p>
<p><a href="${chapterUrl}">Open the lesson in Buildment</a></p>`,
    text: `Your help question was resolved in ${thread.course.title} (${lesson}). Open: ${chapterUrl}`,
  });
}

export async function notifyMenteeCourseEnrollment(enrollmentId: string): Promise<void> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      user: { select: { email: true, name: true } },
      learnerProfile: { select: { email: true } },
      course: { select: { title: true, slug: true, mentor: { select: { name: true } } } },
    },
  });
  if (!enrollment) return;

  const email = enrollment.user?.email ?? enrollment.learnerProfile?.email;
  if (!email) return;

  const mentorLabel = enrollment.course.mentor.name?.trim() || "Your mentor";
  const url = `${appBaseUrl()}/courses/${enrollment.course.slug}`;

  await sendEmail({
    to: email,
    subject: `You're enrolled in ${enrollment.course.title}`,
    html: `<p>Hi ${escapeHtml(enrollment.user?.name ?? "there")},</p>
<p><strong>${escapeHtml(mentorLabel)}</strong> added you to <strong>${escapeHtml(enrollment.course.title)}</strong> on Buildment.</p>
<p><a href="${url}">Start the course</a></p>`,
    text: `You're enrolled in ${enrollment.course.title}. Start: ${url}`,
  });
}

export async function notifyMentorNewEnrollment(enrollmentId: string): Promise<void> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      user: { select: { name: true, email: true } },
      learnerProfile: { select: { email: true } },
      course: {
        select: {
          title: true,
          mentor: { select: { email: true, name: true } },
        },
      },
    },
  });
  const mentorEmail = enrollment?.course.mentor.email;
  if (!enrollment || !mentorEmail) return;

  const learnerLabel =
    enrollment.user?.name?.trim() ||
    enrollment.user?.email ||
    enrollment.learnerProfile?.email ||
    "A learner";
  const url = `${appBaseUrl()}/teach`;

  await sendEmail({
    to: mentorEmail,
    subject: `New learner · ${enrollment.course.title}`,
    html: `<p>Hi ${escapeHtml(enrollment.course.mentor.name ?? "there")},</p>
<p><strong>${escapeHtml(learnerLabel)}</strong> is now enrolled in <strong>${escapeHtml(enrollment.course.title)}</strong>.</p>
<p><a href="${url}">Open your teach workspace</a></p>`,
    text: `${learnerLabel} enrolled in ${enrollment.course.title}. Teach workspace: ${url}`,
  });
}
