import type { Request, Response } from "express";
import { created, ok } from "../utils/responses.js";
import { selfEnroll } from "../services/enrollment/self-enroll.js";
import { completePaymentStub, loadCheckout } from "../services/enrollment/checkout.js";

// POST /api/v1/enrollments
export async function create(req: Request, res: Response) {
  const { courseId } = req.body as { courseId: string };
  const result = await selfEnroll(req.user!.id, courseId);
  created(res, result);
}

// GET /api/v1/courses/:courseSlug/checkout
export async function checkout(req: Request, res: Response) {
  ok(res, await loadCheckout(req.params.courseSlug as string, req.user!.id));
}

// POST /api/v1/enrollments/:enrollmentId/payment-stub
export async function paymentStub(req: Request, res: Response) {
  ok(res, await completePaymentStub(req.params.enrollmentId as string, req.user!.id));
}
