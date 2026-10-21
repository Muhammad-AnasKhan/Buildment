import type { Request, Response } from "express";
import { getCourseImage, uploadCourseImage } from "../services/teach/course-media.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { created } from "../utils/responses.js";

export async function upload(req: Request, res: Response) {
  const { courseId, purpose } = req.params;
  if (typeof courseId !== "string" || (purpose !== "cover" && purpose !== "content")) throw new NotFoundError("Course image destination not found");
  if (!Buffer.isBuffer(req.body)) throw new BadRequestError("Choose an image to upload.", "IMAGE_REQUIRED");
  created(res, await uploadCourseImage(req.user!, courseId, purpose, req.body));
}

export async function read(req: Request, res: Response) {
  const { courseId, purpose, filename } = req.params;
  if (typeof courseId !== "string" || typeof filename !== "string" || (purpose !== "cover" && purpose !== "content")) {
    throw new NotFoundError("Image not found");
  }
  const image = await getCourseImage(req.user, courseId, purpose, filename);
  res.set({
    "Content-Type": image.contentType,
    "Content-Length": String(image.bytes.byteLength),
    "Cache-Control": purpose === "cover" ? "public, max-age=31536000, immutable" : "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(Buffer.from(image.bytes));
}
