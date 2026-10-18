import { Router } from "express";
import { userRateLimit } from "../../middlewares/rate-limit.js";
import * as admin from "../../controllers/admin.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/require-admin.js";
import { validate, validateBody, validateParams } from "../../middlewares/validate.js";
import {
  adminProfileBody,
  adminPasswordBody,
  allocationsBody,
  approveCourseRequestBody,
  createOrganizationBody,
  grantInstructorBody,
  instructorAccessBody,
  orgIdParams,
  requestIdParams,
  userIdParams,
} from "../../validations/admin.js";

// Platform administration: organisations and their integration access,
// course requests, accounts and instructor capability.
const router = Router();

router.use(authenticate, requireAdmin);

const profileLimiter = userRateLimit({ scope: "admin-profile", max: 10, windowMs: 15 * 60_000 });
router.patch("/profile", profileLimiter, validateBody(adminProfileBody), admin.updateProfile);
router.patch("/password", profileLimiter, validateBody(adminPasswordBody), admin.updatePassword);

router.get("/overview", admin.getOverview);
router.get("/courses", admin.listCourses);

router.get("/organizations", admin.listOrganizations);
router.post("/organizations", validateBody(createOrganizationBody), admin.createOrganization);
router.get("/organizations/:orgId", validateParams(orgIdParams), admin.getOrganization);
router.post("/organizations/:orgId/credentials/rotate", validateParams(orgIdParams), admin.rotateCredential);
router.put("/organizations/:orgId/allocations", validate({ params: orgIdParams, body: allocationsBody }), admin.upsertAllocations);

router.get("/course-requests", admin.listCourseRequests);
router.post("/course-requests/:requestId/approve", validate({ params: requestIdParams, body: approveCourseRequestBody }), admin.approveCourseRequest);
router.post("/course-requests/:requestId/reject", validateParams(requestIdParams), admin.rejectCourseRequest);

router.get("/users", admin.listUsers);
router.patch("/users/:userId/instructor-access", validate({ params: userIdParams, body: instructorAccessBody }), admin.setInstructorAccess);
router.post("/instructors", validateBody(grantInstructorBody), admin.grantInstructor);
router.post("/instructor-access-requests/:requestId/approve", validateParams(requestIdParams), admin.approveInstructorRequest);
router.post("/instructor-access-requests/:requestId/reject", validateParams(requestIdParams), admin.rejectInstructorRequest);

export default router;
