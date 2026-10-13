import { z } from "zod";
import { id, params } from "./common.js";

export const chapterParams = params("chapterId");

export const quizSubmitBody = z.object({
  answers: z
    .array(z.object({ blockId: id, selected: z.array(z.string()) }))
    .min(1)
    .max(100),
});
export type QuizSubmitBody = z.infer<typeof quizSubmitBody>;
