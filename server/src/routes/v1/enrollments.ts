import { Router } from "express";
import * as enrollments from "../../controllers/enrollments.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireVerified } from "../../middlewares/require-verified.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { enrollmentParams, selfEnrollBody } from "../../validations/enrollments.js";

const router = Router();

router.use(authenticate, requireVerified);

router.post("/", validateBody(selfEnrollBody), enrollments.create);
router.post("/:enrollmentId/payment-stub", validateParams(enrollmentParams), enrollments.paymentStub);

export default router;
