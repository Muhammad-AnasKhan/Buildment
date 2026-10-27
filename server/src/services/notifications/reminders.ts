import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import type { NotificationType } from "../../shared/api/notifications.js";
import { appBaseUrl } from "../email/send.js";
import { escapeHtml } from "../email/format.js";
import { channelEnabled } from "./config.js";
import { notify, relayUnpushedNotifications, type NotifyInput } from "./service.js";
import {
  courseSuggestionEmail,
  courseSuggestionMessage,
  loadSuggestableCourses,
  rankCourseSuggestions,
  type CourseSuggestionKind,
} from "./course-suggestions.js";
import { signalEmailQueued } from "./email-outbox.js";

// Routine study reminders, run every hour by the scheduler. Reminders are per *user*, not per
// course: everything a person is enrolled in is folded into one message about their best course to
// continue, and REMINDER_DAILY_LIMIT caps how many they get in 24 hours. Timing:
//
//   - New users (fewer than 3 active days in the last 4 weeks): about 24 hours after they were
//     last in the app, i.e. at the same time of day they last showed up.
//   - Users with history: 30 minutes before their usual start time (median first-activity time
//     of day from AppActivityDay), on days they have not been in yet.
//
// A reminder only goes out when the person has been away for the next step of the cadence (1, 3,
// 7, 14, 30 days since their last activity); after the last step reminders stop until they return.
// Times are UTC instants, so no timezone is needed to hit "their" hour.
//
// Learners with no course in progress get the same timing with a course suggestion instead
// (see runStudyReminders).

export const REMINDER_STEPS_DAYS = [1, 3, 7, 14, 30] as const;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
/** A step counts as due this many hours early, so the user's daily send hour can land on it. */
const DUE_TOLERANCE_MS = 3 * HOUR_MS;
const LEARN_WINDOW_DAYS = 28;
const MIN_LEARN_SAMPLES = 3;
const LEAD_MINUTES = 30;

export type ReminderSkipReason =
  | "disabled"
  | "recently-active"
  | "cadence-finished"
  | "not-due"
  | "daily-limit"
  | "not-this-hour";

export type ReminderDecision = { send: true; step: number; sendHourUtc: number } | { send: false; reason: ReminderSkipReason };

/** Median time of day (minutes after UTC midnight) treating the day as a circle (23:50 ≈ 00:10). */
export function circularMedianMinute(minutes: number[]): number {
  const sorted = [...minutes].sort((a, b) => a - b);
  // Cut the circle at its largest gap so a cluster around midnight stays contiguous.
  let cut = 0;
  let largestGap = sorted[0]! + 1440 - sorted.at(-1)!;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i]! - sorted[i - 1]!;
    if (gap > largestGap) {
      largestGap = gap;
      cut = i;
    }
  }
  const unrolled = [...sorted.slice(cut), ...sorted.slice(0, cut).map((m) => m + 1440)];
  return unrolled[Math.floor((unrolled.length - 1) / 2)]! % 1440;
}

/** UTC hour at which this user's reminder goes out. */
export function preferredSendHourUtc(activeDayStarts: Date[], anchor: Date): number {
  if (activeDayStarts.length >= MIN_LEARN_SAMPLES) {
    const median = circularMedianMinute(activeDayStarts.map((d) => d.getUTCHours() * 60 + d.getUTCMinutes()));
    return Math.floor((((median - LEAD_MINUTES) % 1440) + 1440) % 1440 / 60);
  }
  // First hourly run at or after the same time of day they were last here.
  const partial = anchor.getUTCMinutes() > 0 || anchor.getUTCSeconds() > 0 || anchor.getUTCMilliseconds() > 0;
  return (anchor.getUTCHours() + (partial ? 1 : 0)) % 24;
}

export function planStudyReminder(input: {
  now: Date;
  /** Last time the user was active anywhere we can see; null when never. */
  lastActiveAt: Date | null;
  /** Used when the user has never been active: their most recent enrollment. */
  fallbackAnchor: Date;
  /** firstActiveAt of each active day in the last four weeks. */
  activeDayStarts: Date[];
  remindersSinceActive: number;
  remindersLast24h: number;
  dailyLimit: number;
}): ReminderDecision {
  if (input.dailyLimit <= 0) return { send: false, reason: "disabled" };

  const anchor = input.lastActiveAt ?? input.fallbackAnchor;
  const awayMs = input.now.getTime() - anchor.getTime();
  if (awayMs < REMINDER_STEPS_DAYS[0] * DAY_MS - DUE_TOLERANCE_MS) return { send: false, reason: "recently-active" };

  const step = REMINDER_STEPS_DAYS[input.remindersSinceActive];
  if (step === undefined) return { send: false, reason: "cadence-finished" };
  if (awayMs < step * DAY_MS - DUE_TOLERANCE_MS) return { send: false, reason: "not-due" };
  if (input.remindersLast24h >= input.dailyLimit) return { send: false, reason: "daily-limit" };

  const sendHourUtc = preferredSendHourUtc(input.activeDayStarts, anchor);
  if (input.now.getUTCHours() !== sendHourUtc) return { send: false, reason: "not-this-hour" };
  return { send: true, step, sendHourUtc };
}

export type ReminderCourse = {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  percentComplete: number;
  lastActiveAt: Date | null;
  createdAt: Date;
};

/** Best course to continue first: started courses by most recent activity, then newest unstarted. */
export function rankReminderCourses(courses: ReminderCourse[]): ReminderCourse[] {
  return [...courses].sort((a, b) => {
    if (a.lastActiveAt && b.lastActiveAt) return b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
    if (a.lastActiveAt) return -1;
    if (b.lastActiveAt) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function reminderMessage(ranked: ReminderCourse[]) {
  const [main, ...others] = ranked;
  if (!main) throw new Error("reminderMessage needs at least one course");
  const started = main.lastActiveAt !== null;
  const title = started ? `Pick up ${main.title} where you left off` : `Ready to start ${main.title}?`;
  const lead = started
    ? `You're ${main.percentComplete}% through. A short session today keeps your momentum.`
    : "Your first chapter is waiting, and it only takes a few minutes to begin.";
  const otherNames = others.slice(0, 2).map((course) => course.title);
  const more = others.length > 2 ? ` and ${others.length - 2} more` : "";
  const body = others.length ? `${lead} Also waiting: ${otherNames.join(", ")}${more}.` : lead;
  return { title, body, url: `/courses/${main.slug}` };
}

function reminderEmail(ranked: ReminderCourse[], message: ReturnType<typeof reminderMessage>, name: string | null) {
  const items = ranked
    .map((course) => {
      const status = course.lastActiveAt ? `${course.percentComplete}% done` : "not started";
      return `<li><a href="${appBaseUrl()}/courses/${course.slug}">${escapeHtml(course.title)}</a> · ${status}</li>`;
    })
    .join("");
  const textItems = ranked.map((course) => `- ${course.title}: ${appBaseUrl()}/courses/${course.slug}`).join("\n");
  return {
    subject: message.title,
    html: `<p>Hi ${escapeHtml(name ?? "there")},</p>
<p>${escapeHtml(message.body)}</p>
${ranked.length > 1 ? `<ul>${items}</ul>` : ""}
<p><a href="${appBaseUrl()}${message.url}">Continue learning</a></p>`,
    text: `${message.body}\n\n${textItems}`,
  };
}

/** Learners with nothing in progress are only considered this long after their last sign of life. */
const SUGGESTION_WINDOW_DAYS = REMINDER_STEPS_DAYS.at(-1)! + 2;

type ReminderSkip = ReminderSkipReason | "muted" | "no-courses";

/** A learner with no course in progress: never enrolled ("first"), or finished everything ("next"). */
type SuggestionTarget = {
  kind: CourseSuggestionKind;
  lastActiveAt: Date | null;
  signedUpAt: Date;
  enrolledCourseIds: string[];
  lastFinished: { title: string; mentorId: string } | null;
};

/** Enrollments the study reminder covers; a learner with none of these is a suggestion target. */
const ACTIVE_COURSE_WHERE = {
  status: { in: ["ASSIGNED", "IN_PROGRESS"] },
  lifecycle: "ACTIVE",
  course: { status: "PUBLISHED" },
} satisfies Prisma.EnrollmentWhereInput;

/**
 * One hourly pass. Safe to re-run within the hour: the (user, slot) log row makes it a no-op.
 * `userIds` limits the pass to some users (tests, manual runs); the scheduler passes nothing.
 *
 * Two audiences share the cadence, the daily limit and the log, and never overlap:
 *   - learners with active courses get a `study.reminder` about the best one to continue;
 *   - verified learners with no course in progress (never enrolled, or finished everything) get a
 *     `course.suggestion` for a catalog course to start (course-suggestions.ts). Instructors,
 *     admins and learners waiting on a payment are left out.
 */
export async function runStudyReminders(options: { now?: Date; userIds?: string[] } = {}) {
  const now = options.now ?? new Date();
  const summary = { users: 0, sent: 0, suggested: 0, skipped: {} as Partial<Record<ReminderSkip, number>> };
  const skip = (reason: ReminderSkip) => {
    summary.skipped[reason] = (summary.skipped[reason] ?? 0) + 1;
  };
  if (env.REMINDER_DAILY_LIMIT <= 0) return summary;

  const [enrollments, suggestionTargets] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        userId: options.userIds ? { in: options.userIds } : { not: null },
        ...ACTIVE_COURSE_WHERE,
        user: { role: { not: "ADMIN" } },
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        percentComplete: true,
        lastActiveAt: true,
        createdAt: true,
        course: { select: { title: true, slug: true } },
      },
    }),
    loadSuggestionTargets(now, options.userIds),
  ]);

  const byUser = new Map<string, ReminderCourse[]>();
  for (const row of enrollments) {
    const course: ReminderCourse = {
      enrollmentId: row.id,
      courseId: row.courseId,
      title: row.course.title,
      slug: row.course.slug,
      percentComplete: row.percentComplete,
      lastActiveAt: row.lastActiveAt,
      createdAt: row.createdAt,
    };
    byUser.set(row.userId!, [...(byUser.get(row.userId!) ?? []), course]);
  }
  const userIds = [...byUser.keys(), ...suggestionTargets.keys()];
  summary.users = userIds.length;
  if (userIds.length === 0) return summary;

  const learnSince = new Date(now.getTime() - LEARN_WINDOW_DAYS * DAY_MS);
  const logSince = new Date(now.getTime() - (REMINDER_STEPS_DAYS.at(-1)! + 2) * DAY_MS);
  const [activity, days, logs, preferences, catalog] = await Promise.all([
    prisma.userAppActivity.findMany({ where: { userId: { in: userIds } }, select: { userId: true, lastActiveAt: true } }),
    prisma.appActivityDay.findMany({
      where: { userId: { in: userIds }, date: { gte: learnSince } },
      select: { userId: true, firstActiveAt: true },
    }),
    prisma.studyReminderLog.findMany({
      where: { userId: { in: userIds }, sentAt: { gte: logSince } },
      select: { userId: true, sentAt: true },
    }),
    prisma.notificationPreference.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, emailOptOut: true, inAppOptOut: true },
    }),
    suggestionTargets.size ? loadSuggestableCourses(prisma) : Promise.resolve([]),
  ]);
  const appLastActive = new Map(activity.map((row) => [row.userId, row.lastActiveAt]));
  const dayStarts = groupBy(days, (row) => row.userId, (row) => row.firstActiveAt);
  const sentAts = groupBy(logs, (row) => row.userId, (row) => row.sentAt);
  const preferenceOf = new Map(preferences.map((row) => [row.userId, row]));

  const slot = now.toISOString().slice(0, 13); // UTC "YYYY-MM-DDTHH"
  const decide = (userId: string, type: NotificationType, lastActiveAt: Date | null, fallbackAnchor: Date) => {
    const preference = preferenceOf.get(userId);
    if (!channelEnabled(type, "inApp", preference) && !channelEnabled(type, "email", preference)) {
      skip("muted");
      return null;
    }
    const anchor = lastActiveAt ?? fallbackAnchor;
    const sent = sentAts.get(userId) ?? [];
    const decision = planStudyReminder({
      now,
      lastActiveAt,
      fallbackAnchor,
      activeDayStarts: dayStarts.get(userId) ?? [],
      remindersSinceActive: sent.filter((at) => at > anchor).length,
      remindersLast24h: sent.filter((at) => at.getTime() > now.getTime() - DAY_MS).length,
      dailyLimit: env.REMINDER_DAILY_LIMIT,
    });
    if (!decision.send) {
      skip(decision.reason);
      return null;
    }
    return decision;
  };

  for (const [userId, courses] of byUser) {
    const lastActiveAt = latest([appLastActive.get(userId) ?? null, ...courses.map((course) => course.lastActiveAt)]);
    const decision = decide(userId, "study.reminder", lastActiveAt, latest(courses.map((course) => course.createdAt))!);
    if (!decision) continue;

    const ranked = rankReminderCourses(courses);
    const message = reminderMessage(ranked);
    const delivered = await deliverReminder({
      userId,
      slot,
      now,
      courseIds: ranked.map((course) => course.courseId),
      nudgeEnrollmentIds: ranked.map((course) => course.enrollmentId),
      notification: {
        type: "study.reminder",
        recipients: [{ userId }],
        dedupeKey: `study-reminder:${slot}`,
        title: message.title,
        body: message.body,
        url: message.url,
        courseId: ranked[0]!.courseId,
        data: { step: decision.step, courseIds: ranked.map((course) => course.courseId) },
        email: ({ name }) => reminderEmail(ranked, message, name),
      },
    });
    if (delivered) summary.sent += 1;
  }

  for (const [userId, target] of suggestionTargets) {
    const suggestions = rankCourseSuggestions(catalog, {
      excludeCourseIds: target.enrolledCourseIds,
      preferMentorId: target.lastFinished?.mentorId,
    });
    if (suggestions.length === 0) {
      skip("no-courses");
      continue;
    }
    const lastActiveAt = latest([appLastActive.get(userId) ?? null, target.lastActiveAt]);
    const decision = decide(userId, "course.suggestion", lastActiveAt, target.signedUpAt);
    if (!decision) continue;

    const message = courseSuggestionMessage(target.kind, suggestions, target.lastFinished?.title);
    const courseIds = suggestions.map((course) => course.id);
    const delivered = await deliverReminder({
      userId,
      slot,
      now,
      courseIds,
      notification: {
        type: "course.suggestion",
        recipients: [{ userId }],
        dedupeKey: `course-suggestion:${slot}`,
        title: message.title,
        body: message.body,
        url: message.url,
        courseId: courseIds[0],
        data: { step: decision.step, kind: target.kind, courseIds },
        email: ({ name }) => courseSuggestionEmail(suggestions, message, name),
      },
    });
    if (delivered) {
      summary.sent += 1;
      summary.suggested += 1;
    }
  }

  if (summary.sent > 0) {
    await relayUnpushedNotifications();
    signalEmailQueued();
  }
  return summary;
}

async function loadSuggestionTargets(now: Date, userIds: string[] | undefined): Promise<Map<string, SuggestionTarget>> {
  // Only people seen recently: past the last cadence step nothing would be sent anyway, and this
  // keeps long-dormant accounts out of the hourly scan.
  const since = new Date(now.getTime() - SUGGESTION_WINDOW_DAYS * DAY_MS);
  const users = await prisma.user.findMany({
    where: {
      ...(userIds ? { id: { in: userIds } } : {}),
      role: "MENTEE",
      emailVerified: { not: null },
      enrollments: { none: { OR: [ACTIVE_COURSE_WHERE, { lifecycle: "PAYMENT_REQUIRED" }] } },
      OR: [
        { createdAt: { gte: since } },
        { appActivity: { lastActiveAt: { gte: since } } },
        { enrollments: { some: { OR: [{ completedAt: { gte: since } }, { lastActiveAt: { gte: since } }] } } },
      ],
    },
    select: {
      id: true,
      createdAt: true,
      enrollments: {
        select: {
          courseId: true,
          status: true,
          lastActiveAt: true,
          completedAt: true,
          course: { select: { title: true, mentorId: true } },
        },
      },
    },
  });

  const targets = new Map<string, SuggestionTarget>();
  for (const user of users) {
    const finished = user.enrollments
      .filter((row) => row.status === "COMPLETED")
      .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0));
    targets.set(user.id, {
      kind: finished.length ? "next" : "first",
      lastActiveAt: latest(user.enrollments.flatMap((row) => [row.lastActiveAt, row.completedAt])),
      signedUpAt: user.createdAt,
      enrolledCourseIds: user.enrollments.map((row) => row.courseId),
      lastFinished: finished[0] ? { title: finished[0].course.title, mentorId: finished[0].course.mentorId } : null,
    });
  }
  return targets;
}

/** Logs the slot and notifies in one transaction; false when this hour already went out. */
async function deliverReminder(input: {
  userId: string;
  slot: string;
  now: Date;
  courseIds: string[];
  notification: NotifyInput;
  nudgeEnrollmentIds?: string[];
}): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.studyReminderLog.createMany({
      data: [{ userId: input.userId, slot: input.slot, courseIds: input.courseIds, sentAt: input.now }],
      skipDuplicates: true,
    });
    if (count === 0) return false;
    await notify(input.notification, { tx });
    if (input.nudgeEnrollmentIds?.length) {
      await tx.enrollment.updateMany({
        where: { id: { in: input.nudgeEnrollmentIds } },
        data: { lastNudgeSentAt: input.now },
      });
    }
    return true;
  });
}

function latest(dates: (Date | null)[]): Date | null {
  return dates.reduce<Date | null>((best, date) => (date && (!best || date > best) ? date : best), null);
}

function groupBy<T, V>(rows: T[], key: (row: T) => string, value: (row: T) => V): Map<string, V[]> {
  const map = new Map<string, V[]>();
  for (const row of rows) map.set(key(row), [...(map.get(key(row)) ?? []), value(row)]);
  return map;
}
