import { z } from "zod";
import { id } from "./common.js";
import { params } from "./common.js";

export const courseSlugParams = params("courseSlug");

export const chapterPathParams = z.object({ courseSlug: id, chapterSlug: id });

export const chooseVariantBody = z.object({ variantSlug: id });
export const chooseSpecialisationBody = z.object({ specialisationSlug: id });
