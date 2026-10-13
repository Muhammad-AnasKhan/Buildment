import { z } from "zod";
import { id, params } from "./common.js";

export const selfEnrollBody = z.object({ courseId: id });
export const enrollmentParams = params("enrollmentId");
