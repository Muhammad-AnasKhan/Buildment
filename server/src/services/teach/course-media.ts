import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { enrollmentGrantsContentAccess } from "../enrollment/lifecycle.js";
import type { SessionUser } from "../../types/auth.js";
import { AppError, BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../utils/errors.js";
import { requireCourseById } from "./access.js";

export type CourseMediaPurpose = "cover" | "content";
export const MAX_COURSE_IMAGE_BYTES = 8 * 1024 * 1024;

let client: S3Client | undefined;

function storage(): { client: S3Client; bucket: string } {
  if (!env.R2_ENDPOINT || !env.R2_BUCKET || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new AppError("Course image storage is not configured yet.", 503, "MEDIA_STORAGE_UNAVAILABLE");
  }
  client ??= new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
  });
  return { client, bucket: env.R2_BUCKET };
}

function imageFormat(bytes: Buffer): { extension: string; contentType: string } | null {
  if (bytes.length >= 3 && bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { extension: "jpg", contentType: "image/jpeg" };
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { extension: "png", contentType: "image/png" };
  if (bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) return { extension: "gif", contentType: "image/gif" };
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return { extension: "webp", contentType: "image/webp" };
  if (bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp" && ["avif", "avis"].includes(bytes.toString("ascii", 8, 12))) return { extension: "avif", contentType: "image/avif" };
  return null;
}

export async function uploadCourseImage(user: SessionUser, courseId: string, purpose: CourseMediaPurpose, bytes: Buffer): Promise<{ url: string }> {
  await requireCourseById(user, courseId);
  if (!bytes.length || bytes.length > MAX_COURSE_IMAGE_BYTES) throw new BadRequestError("Choose an image smaller than 8 MB.", "INVALID_IMAGE_SIZE");
  const format = imageFormat(bytes);
  if (!format) throw new BadRequestError("Use a JPEG, PNG, WebP, GIF, or AVIF image.", "UNSUPPORTED_IMAGE");
  const { client, bucket } = storage();
  const filename = `${randomUUID().replaceAll("-", "")}.${format.extension}`;
  const key = `courses/${courseId}/${purpose}/${filename}`;
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: bytes,
    ContentType: format.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return { url: `/api/v1/media/courses/${courseId}/${purpose}/${filename}` };
}

export async function getCourseImage(
  user: SessionUser | undefined,
  courseId: string,
  purpose: CourseMediaPurpose,
  filename: string,
): Promise<{ bytes: Uint8Array; contentType: string }> {
  if (!/^[a-f0-9]{32}\.(?:jpg|png|gif|webp|avif)$/.test(filename)) throw new NotFoundError("Image not found");
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { mentorId: true } });
  if (!course) throw new NotFoundError("Image not found");
  if (purpose === "content") {
    if (!user) throw new UnauthorizedError("Sign in to view this course image.");
    if (user.role !== "ADMIN" && course.mentorId !== user.id) {
      const [membership, enrollment] = await Promise.all([
        prisma.courseInstructor.findUnique({ where: { courseId_userId: { courseId, userId: user.id } }, select: { id: true } }),
        prisma.enrollment.findFirst({ where: { courseId, userId: user.id }, select: { lifecycle: true } }),
      ]);
      if (!membership && (!enrollment || !enrollmentGrantsContentAccess(enrollment.lifecycle))) {
        throw new ForbiddenError("You do not have access to this course image.");
      }
    }
  }
  const { client, bucket } = storage();
  try {
    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: `courses/${courseId}/${purpose}/${filename}` }));
    if (!object.Body) throw new NotFoundError("Image not found");
    return { bytes: await object.Body.transformToByteArray(), contentType: object.ContentType ?? "application/octet-stream" };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    if (error instanceof Error && ["NoSuchKey", "NotFound"].includes(error.name)) throw new NotFoundError("Image not found");
    throw error;
  }
}
