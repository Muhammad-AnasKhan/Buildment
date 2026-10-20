import type { Request, Response } from "express";
import { created, noContent, ok } from "../utils/responses.js";
import * as workspace from "../services/teach/workspace.js";
import * as courses from "../services/teach/courses.js";
import * as modules from "../services/teach/modules.js";
import * as chapters from "../services/teach/chapters.js";
import * as mentees from "../services/teach/mentees.js";
import * as invites from "../services/teach/invites.js";
import * as enrollments from "../services/teach/enrollments.js";
import * as reports from "../services/teach/reports.js";
import * as reviews from "../services/teach/reviews.js";
import * as helpInbox from "../services/teach/help-inbox.js";
import type {
  ChapterSettingsBody,
  CourseSettingsBody,
  CreateChapterBody,
  CreateCourseBody,
  HelpInboxQuery,
  MoveDirection,
  SubmitReviewBody,
} from "../validations/teach.js";

// Instructor workspace. Every handler runs behind authenticate + requireVerified +
// requireInstructor; the services decide course ownership.

const param = (req: Request, name: string) => req.params[name] as string;

// GET /api/v1/teach/workspace
export async function getWorkspace(req: Request, res: Response) {
  ok(res, await workspace.loadTeachWorkspace(req.user!));
}

// GET /api/v1/teach/courses
export async function listCourses(req: Request, res: Response) {
  ok(res, await workspace.loadMentorCourses(req.user!));
}

// POST /api/v1/teach/courses
export async function createCourse(req: Request, res: Response) {
  created(res, await courses.createCourse(req.user!, req.body as CreateCourseBody));
}

// GET /api/v1/teach/courses/:courseSlug/builder
export async function getCourseBuilder(req: Request, res: Response) {
  ok(res, await courses.loadCourseBuilder(req.user!, param(req, "courseSlug")));
}

// PATCH /api/v1/teach/courses/:courseId/settings
export async function updateCourseSettings(req: Request, res: Response) {
  await courses.updateCourseSettings(req.user!, param(req, "courseId"), req.body as CourseSettingsBody);
  noContent(res);
}

// POST /api/v1/teach/courses/:courseId/publish
export async function publishCourse(req: Request, res: Response) {
  ok(res, await courses.publishCourse(req.user!, param(req, "courseId")));
}

// POST /api/v1/teach/courses/:courseId/unpublish
export async function unpublishCourse(req: Request, res: Response) {
  const body = req.body as { confirmedWithEnrollments?: boolean };
  ok(res, await courses.unpublishCourse(req.user!, param(req, "courseId"), body));
}

// POST /api/v1/teach/courses/:courseId/restore
export async function restoreCourse(req: Request, res: Response) {
  ok(res, await courses.restoreCourseToDraft(req.user!, param(req, "courseId")));
}

// DELETE /api/v1/teach/courses/:courseId
export async function deleteCourse(req: Request, res: Response) {
  const body = req.body as { confirmedWithEnrollments?: boolean };
  ok(res, await courses.deleteCourse(req.user!, param(req, "courseId"), body));
}

// POST /api/v1/teach/courses/:courseId/modules
export async function createModule(req: Request, res: Response) {
  const { title } = req.body as { title: string };
  created(res, await modules.createModule(req.user!, param(req, "courseId"), title));
}

// PATCH /api/v1/teach/modules/:moduleId
export async function renameModule(req: Request, res: Response) {
  const { title } = req.body as { title: string };
  await modules.renameModule(req.user!, param(req, "moduleId"), title);
  noContent(res);
}

// POST /api/v1/teach/modules/:moduleId/move
export async function moveModule(req: Request, res: Response) {
  const { direction } = req.body as { direction: MoveDirection };
  await modules.moveModule(req.user!, param(req, "moduleId"), direction);
  noContent(res);
}

// POST /api/v1/teach/courses/:courseId/chapters
export async function createChapter(req: Request, res: Response) {
  created(res, await chapters.createChapter(req.user!, param(req, "courseId"), req.body as CreateChapterBody));
}

// POST /api/v1/teach/chapters/:chapterId/move
export async function moveChapter(req: Request, res: Response) {
  const { direction } = req.body as { direction: MoveDirection };
  await chapters.moveChapter(req.user!, param(req, "chapterId"), direction);
  noContent(res);
}

// GET /api/v1/teach/chapters/:chapterId/editor
export async function getChapterEditor(req: Request, res: Response) {
  ok(res, await chapters.loadChapterEditor(req.user!, param(req, "chapterId")));
}

// PATCH /api/v1/teach/chapters/:chapterId/settings
export async function updateChapterSettings(req: Request, res: Response) {
  ok(res, await chapters.updateChapterSettings(req.user!, param(req, "chapterId"), req.body as ChapterSettingsBody));
}

// PUT /api/v1/teach/chapters/:chapterId/draft
export async function saveChapterDraft(req: Request, res: Response) {
  const { source } = req.body as { source: string };
  ok(res, await chapters.saveChapterDraft(req.user!, param(req, "chapterId"), source));
}

// POST /api/v1/teach/chapters/:chapterId/publish
export async function publishChapter(req: Request, res: Response) {
  await chapters.publishChapter(req.user!, param(req, "chapterId"));
  noContent(res);
}

// DELETE /api/v1/teach/chapters/:chapterId
export async function removeChapter(req: Request, res: Response) {
  const body = req.body as { confirmedWithProgress?: boolean };
  await chapters.removeChapter(req.user!, param(req, "chapterId"), body);
  noContent(res);
}

// GET /api/v1/teach/courses/:courseSlug/mentees
export async function listMentees(req: Request, res: Response) {
  ok(res, await mentees.loadCourseMentees(req.user!, param(req, "courseSlug")));
}

// GET /api/v1/teach/courses/:courseSlug/mentees/:enrollmentId
export async function getMenteeEvaluation(req: Request, res: Response) {
  ok(res, await mentees.loadMenteeEvaluationForCourse(req.user!, param(req, "courseSlug"), param(req, "enrollmentId")));
}

// POST /api/v1/teach/courses/:courseId/invites/assign
export async function assignByEmails(req: Request, res: Response) {
  const { emails } = req.body as { emails: string };
  ok(res, await invites.assignByEmails(req.user!, param(req, "courseId"), emails));
}

// POST /api/v1/teach/courses/:courseId/invites/link
export async function createInviteLink(req: Request, res: Response) {
  const result = await invites.createInviteLink(req.user!, param(req, "courseId"));
  if (result.reused) ok(res, result);
  else created(res, result);
}

// DELETE /api/v1/teach/courses/:courseId/invites/:inviteId
export async function revokeInvite(req: Request, res: Response) {
  await invites.revokeInvite(req.user!, param(req, "courseId"), param(req, "inviteId"));
  noContent(res);
}

// POST /api/v1/teach/enrollments/:enrollmentId/nudge
export async function nudgeMentee(req: Request, res: Response) {
  await enrollments.nudgeMentee(req.user!, param(req, "enrollmentId"));
  noContent(res);
}

// POST /api/v1/teach/enrollments/:enrollmentId/repair-progress
export async function repairProgress(req: Request, res: Response) {
  await enrollments.repairProgress(req.user!, param(req, "enrollmentId"));
  noContent(res);
}

// GET /api/v1/teach/courses/:courseSlug/reports?chapterId=
export async function getCourseReport(req: Request, res: Response) {
  const { chapterId } = req.query as { chapterId?: string };
  ok(res, await reports.loadCourseReport(req.user!, param(req, "courseSlug"), chapterId));
}

// GET /api/v1/teach/courses/:courseSlug/reports/export — CSV download, not the JSON envelope
export async function exportCourseReport(req: Request, res: Response) {
  const { filename, csv } = await reports.exportCourseReportCsv(req.user!, param(req, "courseSlug"));
  res.attachment(filename).type("text/csv; charset=utf-8").send(csv);
}

// GET /api/v1/teach/courses/:courseSlug/activity
export async function getCourseActivity(req: Request, res: Response) {
  ok(res, await reports.loadCourseActivity(req.user!, param(req, "courseSlug")));
}

// GET /api/v1/teach/review?courseId=
export async function getReviewQueue(req: Request, res: Response) {
  const { courseId } = req.query as { courseId?: string };
  ok(res, await reviews.loadReviewQueue(req.user!, courseId));
}

// GET /api/v1/teach/review/:responseId
export async function getReviewDetail(req: Request, res: Response) {
  ok(res, await reviews.loadReviewDetail(req.user!, param(req, "responseId")));
}

// POST /api/v1/teach/review/:responseId
export async function submitReview(req: Request, res: Response) {
  await reviews.submitReview(req.user!, param(req, "responseId"), req.body as SubmitReviewBody);
  noContent(res);
}

// POST /api/v1/teach/review/:responseId/ai-draft
export async function generateAiReviewDraft(req: Request, res: Response) {
  ok(res, await reviews.generateAiReviewDraft(req.user!, param(req, "responseId")));
}

// GET /api/v1/teach/help/threads?courseId=&status=
export async function getHelpInbox(req: Request, res: Response) {
  ok(res, await helpInbox.loadMentorHelpInbox(req.user!, req.query as HelpInboxQuery));
}
