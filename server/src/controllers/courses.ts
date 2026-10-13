import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { continueChapterPath } from "../services/courses/continue.js";
import { getCourseOverview } from "../services/courses/overview.js";
import { loadChapterReader } from "../services/chapters/reader.js";

// GET /api/v1/courses/:courseSlug/continue
export async function continueChapter(req: Request, res: Response) {
  const result = await continueChapterPath({ courseSlug: req.params.courseSlug as string, user: req.user });
  ok(res, result);
}

// GET /api/v1/courses/:courseSlug/overview
export async function overview(req: Request, res: Response) {
  ok(res, await getCourseOverview(req.params.courseSlug as string, req.user!));
}

// GET /api/v1/courses/:courseSlug/chapters/:chapterSlug
export async function chapter(req: Request, res: Response) {
  const { courseSlug, chapterSlug } = req.params as { courseSlug: string; chapterSlug: string };
  ok(res, await loadChapterReader(courseSlug, chapterSlug, req.user!));
}
