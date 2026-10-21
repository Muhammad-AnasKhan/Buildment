import { z } from "zod";
import { INTEGRITY_EVENT_TYPES, INTEGRITY_LIMITS } from "../shared/api/integrity.js";
import { id, params } from "./common.js";

export const attemptParams = params("attemptId");

const metaValue = z.union([z.string().max(120), z.number().finite(), z.boolean()]);

export const integrityEventsBody = z.object({
  events: z
    .array(
      z.object({
        id: z.string().regex(/^[A-Za-z0-9_-]{8,40}$/),
        type: z.enum(INTEGRITY_EVENT_TYPES),
        at: z.string().datetime({ offset: true }),
        blockId: id.max(64).nullish(),
        meta: z
          .record(z.string().max(32), metaValue)
          .refine((meta) => Object.keys(meta).length <= 8, "Too many meta fields")
          .optional(),
      })
    )
    .min(1)
    .max(INTEGRITY_LIMITS.eventsPerBatch),
});
export type IntegrityEventsBody = z.infer<typeof integrityEventsBody>;

export const integrityCameraBody = z.object({ status: z.enum(["ON", "DECLINED", "UNAVAILABLE"]) });
export type IntegrityCameraBody = z.infer<typeof integrityCameraBody>;

export const courseIntegrityBody = z.object({ integritySnapshots: z.boolean() });

export const snapshotFileParams = z.object({ file: z.string().regex(/^[a-z0-9]{20,40}\.jpg$/) });
