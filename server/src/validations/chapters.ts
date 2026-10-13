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

export const checklistItemParams = z.object({ chapterId: id, itemId: z.string().min(1).max(200) });
export const checklistItemBody = z.object({ checked: z.boolean() });

export const learningLogBody = z.object({ answers: z.record(z.string(), z.string()) });

export const headingNoteParams = z.object({ chapterId: id, headingId: z.string().min(1).max(160) });
export const headingNoteBody = z.object({ body: z.string().max(2000) });
