import { COURSE_TRACK_ERROR_CODES, type UpdateCourseTrackResult } from "../../shared/api/catalog.js";
import {
  buildCourseTrack,
  courseFinished,
  findCourseFamily,
  findSpecialisation,
  findVariant,
  type CourseFamily,
} from "../../shared/lib/course-tracks.js";
import { prisma } from "../../db/prisma.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { requireBlockSubmissionAccess } from "../enrollment/api-learn-access.js";

// The learner's own choices inside a course family: which product variant they
// build, and which specialisation they take once the course is complete.

async function loadFamilyEnrollment(courseSlug: string, user: SessionUser) {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true, slug: true, familySlug: true } });
  if (!course) throw new NotFoundError("Course not found");
  const family = findCourseFamily(course.familySlug);
  if (!family) throw new ConflictError("This course has no variants to choose from.", COURSE_TRACK_ERROR_CODES.NO_FAMILY);
  const enrollment = await requireBlockSubmissionAccess(course.id, user);
  return { course, family, enrollment };
}

function result(courseSlug: string, family: CourseFamily, enrollment: Parameters<typeof buildCourseTrack>[1]): UpdateCourseTrackResult {
  return { courseSlug, track: buildCourseTrack(family.slug, enrollment)! };
}

/** Pick or change the variant. Locked once the course is complete. */
export async function chooseCourseVariant(courseSlug: string, user: SessionUser, variantSlug: string): Promise<UpdateCourseTrackResult> {
  const { course, family, enrollment } = await loadFamilyEnrollment(courseSlug, user);
  if (!findVariant(family, variantSlug)) throw new BadRequestError("Unknown variant for this course.");
  if (courseFinished(enrollment)) {
    throw new ConflictError("The variant is fixed once the course is complete.", COURSE_TRACK_ERROR_CODES.COURSE_FINISHED);
  }
  const updated = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { variantSlug, variantChosenAt: new Date() },
  });
  return result(course.slug, family, updated);
}

/** Pick the specialisation that follows the course. Opens once every chapter is complete. */
export async function chooseCourseSpecialisation(
  courseSlug: string,
  user: SessionUser,
  specialisationSlug: string
): Promise<UpdateCourseTrackResult> {
  const { course, family, enrollment } = await loadFamilyEnrollment(courseSlug, user);
  if (!findSpecialisation(family, specialisationSlug)) throw new BadRequestError("Unknown specialisation for this course.");
  if (!courseFinished(enrollment)) {
    throw new ConflictError("Finish the course to choose a specialisation.", COURSE_TRACK_ERROR_CODES.NOT_FINISHED);
  }
  const updated = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { specialisationSlug, specialisationChosenAt: new Date() },
  });
  return result(course.slug, family, updated);
}
