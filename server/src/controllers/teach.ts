import type { Request, Response } from "express";
import { created, noContent, ok } from "../utils/responses.js";
import * as workspace from "../services/teach/workspace.js";
import * as courses from "../services/teach/courses.js";
import * as modules from "../services/teach/modules.js";
import * as chapters from "../services/teach/chapters.js";
import type {
  ChapterSettingsBody,
  CourseSettingsBody,
  CreateChapterBody,
  CreateCourseBody,
  MoveDirection,
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
