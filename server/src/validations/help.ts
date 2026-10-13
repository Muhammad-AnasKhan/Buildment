import { z } from "zod";
import { id, params } from "./common.js";

const messageBody = z
  .string()
  .trim()
  .min(10, "Please add a bit more detail (at least 10 characters).")
  .max(4000, "Message is too long (max 4000 characters).");

export const threadParams = params("threadId");

export const askFromChapterBody = z.object({ courseId: id, chapterId: id, body: messageBody });
export type AskFromChapterBody = z.infer<typeof askFromChapterBody>;

export const replyBody = z.object({ body: messageBody });
