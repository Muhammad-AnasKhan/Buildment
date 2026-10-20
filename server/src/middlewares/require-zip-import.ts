import type { RequestHandler } from "express";
import { prisma } from "../db/prisma.js";
import { ForbiddenError } from "../utils/errors.js";

/** Check before reading the archive so disabled uploads are never processed. */
export const requireZipImport: RequestHandler = async (req, _res, next) => {
  const user = req.user && await prisma.user.findUnique({
    where: { id: req.user.id }, select: { zipImportEnabled: true },
  });
  if (!user?.zipImportEnabled) {
    return next(new ForbiddenError("ZIP import is not enabled for your account", "ZIP_IMPORT_DISABLED"));
  }
  next();
};
