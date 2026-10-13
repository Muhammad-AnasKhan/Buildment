import type { Request, Response } from "express";
import { ok } from "../utils/responses.js";
import { getCatalogCourse, listCatalog } from "../services/catalog/catalog.js";

// GET /api/v1/catalog
export async function list(req: Request, res: Response) {
  ok(res, { courses: await listCatalog(req.user?.id) });
}

// GET /api/v1/catalog/:courseSlug
export async function detail(req: Request, res: Response) {
  ok(res, await getCatalogCourse(req.params.courseSlug as string, req.user!.id));
}
