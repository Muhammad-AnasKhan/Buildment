import type { Request, Response } from "express";
import { BadRequestError } from "../utils/errors.js";
import { created, ok } from "../utils/responses.js";
import {
  openIntegrityAttempt,
  recordIntegrityEvents,
  saveIntegritySnapshot,
  setIntegrityCamera,
} from "../services/integrity/attempts.js";
import {
  loadIntegrityAttemptDetail,
  readSignedSnapshot,
  updateCourseIntegritySettings,
} from "../services/integrity/review.js";
import type { IntegrityCameraBody, IntegrityEventsBody } from "../validations/integrity.js";

// POST /api/v1/chapters/:chapterId/integrity
export async function openAttempt(req: Request, res: Response) {
  ok(res, await openIntegrityAttempt(req.user, req.params.chapterId as string));
}

// POST /api/v1/integrity/attempts/:attemptId/events
export async function recordEvents(req: Request, res: Response) {
  const { events } = req.body as IntegrityEventsBody;
  ok(res, await recordIntegrityEvents(req.user, req.params.attemptId as string, events));
}

// PUT /api/v1/integrity/attempts/:attemptId/camera
export async function setCamera(req: Request, res: Response) {
  const { status } = req.body as IntegrityCameraBody;
  ok(res, await setIntegrityCamera(req.user, req.params.attemptId as string, status));
}

// POST /api/v1/integrity/attempts/:attemptId/snapshots (body: image/jpeg bytes)
export async function uploadSnapshot(req: Request, res: Response) {
  if (!Buffer.isBuffer(req.body)) throw new BadRequestError("Send one small JPEG image.", "INVALID_SNAPSHOT");
  created(res, await saveIntegritySnapshot(req.user, req.params.attemptId as string, req.body));
}

// GET /api/v1/teach/integrity/attempts/:attemptId
export async function attemptDetail(req: Request, res: Response) {
  ok(res, await loadIntegrityAttemptDetail(req.user!, req.params.attemptId as string));
}

// PUT /api/v1/teach/courses/:courseId/integrity
export async function updateCourseSettings(req: Request, res: Response) {
  const { integritySnapshots } = req.body as { integritySnapshots: boolean };
  ok(res, await updateCourseIntegritySettings(req.user!, req.params.courseId as string, integritySnapshots));
}

// GET /api/v1/media/integrity/:file?exp=&sig= (signed, short-lived)
export async function readSnapshot(req: Request, res: Response) {
  const snapshotId = (req.params.file as string).replace(/\.jpg$/, "");
  const bytes = await readSignedSnapshot(snapshotId, req.query.exp, req.query.sig);
  res.set({
    "Content-Type": "image/jpeg",
    "Content-Length": String(bytes.byteLength),
    "Cache-Control": "private, max-age=300",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(bytes);
}
