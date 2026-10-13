import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { continueChapterPath } from "../services/courses/continue.js";

// GET /api/v1/courses/:courseSlug/continue
export async function continueChapter(req: Request, res: Response) {
  const result = await continueChapterPath({ courseSlug: req.params.courseSlug as string, user: req.user });
  ok(res, result);
}
