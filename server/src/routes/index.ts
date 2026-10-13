import { Router } from "express";
import v1Routes from "./v1/index.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/api/v1", v1Routes);

export default router;
