import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { continueChapterPath } from "../services/courses/continue.js";
import { getCourseOverview } from "../services/courses/overview.js";

// GET /api/v1/courses/:courseSlug/continue
export async function continueChapter(req: Request, res: Response) {
  const result = await continueChapterPath({ courseSlug: req.params.courseSlug as string, user: req.user });
  ok(res, result);
}

// GET /api/v1/courses/:courseSlug/overview
export async function overview(req: Request, res: Response) {
  ok(res, await getCourseOverview(req.params.courseSlug as string, req.user!));
}
