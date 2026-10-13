import { z } from "zod";
import { email } from "./common.js";

export const confirmEmailQuery = z.object({ token: z.string().trim().optional() });

export const devLoginQuery = z.object({
  email: email.optional(),
  redirectTo: z.string().optional(),
});
