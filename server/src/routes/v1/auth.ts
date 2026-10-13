import { Router } from "express";
import * as auth from "../../controllers/auth.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { validateQuery } from "../../middlewares/validate.js";
import { confirmEmailQuery, devLoginQuery } from "../../validations/auth.js";

const router = Router();

router.get("/confirm-email", validateQuery(confirmEmailQuery), auth.confirmEmail);
router.get("/dev-login", validateQuery(devLoginQuery), auth.devLogin);
router.get("/me", authenticate, auth.me);

export default router;
