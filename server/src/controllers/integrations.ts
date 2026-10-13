import type { Request, Response } from "express";
import { INTEGRATION_ACCESS_KEY_HEADER, INTEGRATION_SECRET_KEY_HEADER } from "@buildment/shared/api/integrations";
import { listAllocatedCourses, listAllocations } from "../services/integrations/catalog.js";
import { cancelEnrollment, createEnrollment, lookupEnrollment } from "../services/integrations/enrollments.js";
import { getLearnerProgress } from "../services/integrations/progress.js";
import { createCourseRequest, listCourseRequests } from "../services/integrations/course-requests.js";
import type {
  CancelEnrollmentBody,
  CreateEnrollmentBody,
  EnrollmentLookupQuery,
} from "../validations/integrations.js";

// Public organisation API (/integrations/v1). Response bodies are a published,
// snake_case contract — Pathment consumes them — so they are returned as-is
// rather than through the first-party envelope.

const ENDPOINTS = [
  { method: "GET", path: "/integrations/v1/connection", description: "Verify API credentials" },
  { method: "GET", path: "/integrations/v1/courses", description: "List allocated published courses" },
  { method: "GET", path: "/integrations/v1/allocations", description: "List course allocations for your org" },
  {
    method: "GET",
    path: "/integrations/v1/enrollments",
    description: "Lookup enrollment by course_id + learner_email or external_assignment_id",
  },
  { method: "POST", path: "/integrations/v1/enrollments", description: "Create Pathment-style enrollment" },
  {
    method: "POST",
    path: "/integrations/v1/enrollments/cancel",
    description: "Cancel org enrollment (org_slug, email, course_id, optional user_id / mentor_id)",
  },
  { method: "GET", path: "/integrations/v1/progress", description: "Progress for org enrollment" },
  { method: "GET", path: "/integrations/v1/course-requests", description: "List course access requests for your org" },
  { method: "POST", path: "/integrations/v1/course-requests", description: "Request access to a published course" },
] as const;

export function describe(_req: Request, res: Response) {
  res.json({
    name: "Buildment Organization API",
    version: "v1",
    auth: { headers: [INTEGRATION_ACCESS_KEY_HEADER, INTEGRATION_SECRET_KEY_HEADER] },
    endpoints: ENDPOINTS,
  });
}

export function connection(req: Request, res: Response) {
  const org = req.organization!;
  res.json({ connected: true, organization_slug: org.slug, organization_name: org.name });
}

export async function courses(req: Request, res: Response) {
  res.json({ courses: await listAllocatedCourses(req.organization!) });
}

export async function allocations(req: Request, res: Response) {
  res.json({ allocations: await listAllocations(req.organization!) });
}

export async function getEnrollment(req: Request, res: Response) {
  const enrollment = await lookupEnrollment(req.organization!, req.query as EnrollmentLookupQuery);
  res.json({ enrollment });
}

export async function postEnrollment(req: Request, res: Response) {
  const { created, body } = await createEnrollment(req.organization!, req.body as CreateEnrollmentBody);
  res.status(created ? 201 : 200).json(body);
}

export async function postCancelEnrollment(req: Request, res: Response) {
  res.json(await cancelEnrollment(req.organization!, req.body as CancelEnrollmentBody));
}

export async function progress(req: Request, res: Response) {
  const { course_id, learner_email } = req.query as { course_id: string; learner_email: string };
  res.json(await getLearnerProgress(req.organization!, { courseId: course_id, learnerEmail: learner_email }));
}

export async function getCourseRequests(req: Request, res: Response) {
  const { status } = req.query as { status?: "PENDING" | "APPROVED" | "REJECTED" };
  res.json({ requests: await listCourseRequests(req.organization!, status) });
}

export async function postCourseRequest(req: Request, res: Response) {
  const { course_id } = req.body as { course_id: string };
  const result = await createCourseRequest(req.organization!, course_id);
  res.status(result.created ? 201 : 200).json(result);
}
