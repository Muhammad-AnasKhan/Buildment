// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { CoursePricingType, CourseStatus } from "../domain/enums";

// Rules a course must satisfy before it goes live. The API enforces them on
// publish; the web app shows the same reasons next to the button.

export type PublishValidationInput = {
  status: CourseStatus;
  pricingType: CoursePricingType;
  priceCents: number;
  chapterCount: number;
  publishedChapterCount: number;
};

export function validateCoursePublish(input: PublishValidationInput): string[] {
  const errors: string[] = [];
  if (input.status === "PUBLISHED") return errors;
  if (input.chapterCount === 0) {
    errors.push("Add at least one chapter before publishing.");
  }
  if (input.pricingType === "PAID" && input.priceCents <= 0) {
    errors.push("Set a price greater than zero for paid courses.");
  }
  return errors;
}

export function formatPriceDisplay(priceCents: number, currency: string): string {
  const amount = priceCents / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
