import { Router } from "express";
import * as integrations from "../controllers/integrations.js";
import { requireOrganization } from "../middlewares/authenticate-organization.js";
import { integrationErrorHandler } from "../middlewares/integration-error-handler.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import {
  cancelEnrollmentBody,
  courseRequestsQuery,
  createCourseRequestBody,
  createEnrollmentBody,
  enrollmentLookupQuery,
  progressQuery,
} from "../validations/integrations.js";

// Public organisation API — credential headers on every call except the index.
const router = Router();

router.get("/", integrations.describe);

router.use(requireOrganization);

router.get("/connection", integrations.connection);
router.get("/courses", integrations.courses);
router.get("/allocations", integrations.allocations);
router.get("/coupons", integrations.coupons);
router.get("/enrollments", validateQuery(enrollmentLookupQuery), integrations.getEnrollment);
router.post("/enrollments", validateBody(createEnrollmentBody), integrations.postEnrollment);
router.post("/enrollments/cancel", validateBody(cancelEnrollmentBody), integrations.postCancelEnrollment);
router.get("/progress", validateQuery(progressQuery), integrations.progress);
router.get("/course-requests", validateQuery(courseRequestsQuery), integrations.getCourseRequests);
router.post("/course-requests", validateBody(createCourseRequestBody), integrations.postCourseRequest);

router.use(integrationErrorHandler);

export default router;
