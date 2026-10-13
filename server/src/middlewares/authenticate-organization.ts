import type { RequestHandler } from "express";
import { authenticateOrganization } from "../services/integrations/authenticate-organization.js";
import { INTEGRATION_ACCESS_KEY_HEADER, INTEGRATION_SECRET_KEY_HEADER } from "../shared/api/integrations.js";

/** Public organisation API: access + secret key headers identify the tenant. */
export const requireOrganization: RequestHandler = async (req, _res, next) => {
  try {
    req.organization = await authenticateOrganization({
      accessKey: req.header(INTEGRATION_ACCESS_KEY_HEADER),
      secretKey: req.header(INTEGRATION_SECRET_KEY_HEADER),
    });
    next();
  } catch (error) {
    next(error);
  }
};
