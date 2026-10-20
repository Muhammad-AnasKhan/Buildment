import type { Request, Response } from "express";
import { created, noContent, ok } from "../utils/responses.js";
import * as overview from "../services/admin/overview.js";
import * as organizations from "../services/admin/organizations.js";
import * as courseRequests from "../services/admin/course-requests.js";
import * as users from "../services/admin/users.js";
import * as profile from "../services/admin/profile.js";
import type {
  AdminProfileBody,
  AdminPasswordBody,
  AllocationsBody,
  ApproveCourseRequestBody,
  CreateOrganizationBody,
  GrantAdminBody,
  GrantInstructorBody,
} from "../validations/admin.js";

// Platform administration. Every handler runs behind authenticate + requireAdmin.

const param = (req: Request, name: string) => req.params[name] as string;

// PATCH /api/v1/admin/profile
export async function updateProfile(req: Request, res: Response) {
  await profile.updateAdminProfile(req.user!.id, req.body as AdminProfileBody);
  noContent(res);
}

// PATCH /api/v1/admin/password
export async function updatePassword(req: Request, res: Response) {
  await profile.updateAdminPassword(req.user!.id, req.sessionToken!, req.body as AdminPasswordBody);
  noContent(res);
}

// GET /api/v1/admin/overview
export async function getOverview(_req: Request, res: Response) {
  ok(res, await overview.loadOverview());
}

// GET /api/v1/admin/courses
export async function listCourses(_req: Request, res: Response) {
  ok(res, { courses: await overview.listCourses() });
}

// GET /api/v1/admin/organizations
export async function listOrganizations(_req: Request, res: Response) {
  ok(res, { organizations: await organizations.listOrganizations() });
}

// POST /api/v1/admin/organizations — the response is the only time the secret is visible
export async function createOrganization(req: Request, res: Response) {
  created(res, await organizations.createOrganization(req.body as CreateOrganizationBody));
}

// GET /api/v1/admin/organizations/:orgId
export async function getOrganization(req: Request, res: Response) {
  ok(res, await organizations.getOrganization(param(req, "orgId")));
}

// POST /api/v1/admin/organizations/:orgId/credentials/rotate
export async function rotateCredential(req: Request, res: Response) {
  created(res, await organizations.rotateCredential(param(req, "orgId")));
}

// PUT /api/v1/admin/organizations/:orgId/allocations
export async function upsertAllocations(req: Request, res: Response) {
  await organizations.upsertAllocations(req.user!, param(req, "orgId"), req.body as AllocationsBody);
  noContent(res);
}

// GET /api/v1/admin/course-requests
export async function listCourseRequests(_req: Request, res: Response) {
  ok(res, await courseRequests.listCourseRequests());
}

// POST /api/v1/admin/course-requests/:requestId/approve
export async function approveCourseRequest(req: Request, res: Response) {
  await courseRequests.approveCourseRequest(req.user!, param(req, "requestId"), req.body as ApproveCourseRequestBody);
  noContent(res);
}

// POST /api/v1/admin/course-requests/:requestId/reject
export async function rejectCourseRequest(req: Request, res: Response) {
  await courseRequests.rejectCourseRequest(req.user!, param(req, "requestId"));
  noContent(res);
}

// GET /api/v1/admin/users
export async function listUsers(_req: Request, res: Response) {
  ok(res, await users.listUsers());
}

// PATCH /api/v1/admin/users/:userId/instructor-access
export async function setInstructorAccess(req: Request, res: Response) {
  const { enabled } = req.body as { enabled: boolean };
  await users.setInstructorAccess(param(req, "userId"), enabled);
  noContent(res);
}

export async function setZipImportAccess(req: Request, res: Response) {
  await users.setZipImportAccess(param(req, "userId"), req.body.enabled);
  noContent(res);
}

// POST /api/v1/admin/instructors
export async function grantInstructor(req: Request, res: Response) {
  await users.grantInstructorByEmail(req.body as GrantInstructorBody);
  noContent(res);
}

// POST /api/v1/admin/admins
export async function grantAdmin(req: Request, res: Response) {
  await users.grantAdminByEmail(req.body as GrantAdminBody);
  noContent(res);
}

// POST /api/v1/admin/instructor-access-requests/:requestId/approve
export async function approveInstructorRequest(req: Request, res: Response) {
  await users.approveInstructorRequest(req.user!, param(req, "requestId"));
  noContent(res);
}

// POST /api/v1/admin/instructor-access-requests/:requestId/reject
export async function rejectInstructorRequest(req: Request, res: Response) {
  await users.rejectInstructorRequest(req.user!, param(req, "requestId"));
  noContent(res);
}
