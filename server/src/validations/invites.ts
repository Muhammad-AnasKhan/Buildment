import { z } from "zod";
import { params } from "./common.js";

export const inviteParams = params("token");
export const acceptInviteBody = z.object({ name: z.string().trim().max(120).optional() });
