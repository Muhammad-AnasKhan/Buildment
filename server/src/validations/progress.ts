import { z } from "zod";
import { id } from "./common.js";

const deltaSeconds = z.number().int().positive().max(20).optional();

export const heartbeatBody = z.object({ chapterId: id, deltaSeconds });
export type HeartbeatBody = z.infer<typeof heartbeatBody>;

export const sessionQuery = z.object({ chapterId: id });

export const sessionBody = z.object({
  chapterId: id,
  action: z.enum(["start", "pause", "resume", "end"]),
  deltaSeconds,
});
export type SessionBody = z.infer<typeof sessionBody>;
