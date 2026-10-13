import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  completeEnrollmentPaymentStubAction,
  selfEnrollInCourseAction,
} from "@/server/actions/enroll";
import { loadCheckoutForCourseSlug } from "@/server/enrollment/load-checkout";
import { formatPriceCents } from "@/lib/format-price";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CourseCheckoutPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const data = await loadCheckoutForCourseSlug(courseSlug);
  if (!data) notFound();

  const { course, enrollment } = data;
  if ("alreadyPaid" in data && data.alreadyPaid) {
    redirect(`/courses/${course.slug}`);
  }

  if (course.pricingType !== "PAID") {
    redirect(`/catalog/${course.slug}`);
  }

  const priceLabel = formatPriceCents(course.priceCents, course.currency);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <Link href={`/catalog/${course.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to course details
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Complete payment to unlock <span className="font-medium text-foreground">{course.title}</span>.
      </p>

      <div className="mt-8 rounded-2xl border bg-card p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-muted-foreground">Total due</span>
          <span className="text-2xl font-semibold tabular-nums">{priceLabel}</span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Stripe integration is not connected yet. Use the button below to simulate a successful
          payment in development. Organization allocations (Pathment) do not waive learner payment
          for paid courses.
        </p>

        {!enrollment ? (
          <form action={selfEnrollInCourseAction} className="mt-6">
            <input type="hidden" name="courseId" value={course.id} />
            <Button type="submit" className="w-full">
              Enroll & continue
            </Button>
          </form>
        ) : (
          <form action={completeEnrollmentPaymentStubAction} className="mt-6">
            <input type="hidden" name="enrollmentId" value={enrollment.id} />
            <Button type="submit" className="w-full">
              Pay {priceLabel} (stub)
            </Button>
          </form>
        )}
      </div>

      <Link href="/my-courses" className={cn(buttonVariants({ variant: "ghost" }), "mt-6 self-center")}>
        My courses
      </Link>
    </div>
  );
}
