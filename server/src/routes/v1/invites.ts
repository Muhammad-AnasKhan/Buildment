import { Router } from "express";
import * as invites from "../../controllers/invites.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireVerified } from "../../middlewares/require-verified.js";
import { validate, validateParams } from "../../middlewares/validate.js";
import { acceptInviteBody, inviteParams } from "../../validations/invites.js";

const router = Router();

router.get("/:token", validateParams(inviteParams), invites.show);
router.post("/:token/accept", authenticate, requireVerified, validate({ params: inviteParams, body: acceptInviteBody }), invites.accept);

export default router;
