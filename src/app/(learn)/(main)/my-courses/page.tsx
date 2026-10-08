import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MenteeCourseList } from "@/components/learn/dashboard/mentee-dashboard";
import { requireLearnSurface } from "@/server/auth/guards";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import { loadMenteeDashboard } from "@/server/dashboard/load-mentee-dashboard";

export default async function MenteeCoursesPage() {
  const user = await requireLearnSurface();
  const model = await loadMenteeDashboard({
    learnerId: user.id,
    learnerName: user.name?.trim() || user.email?.split("@")[0] || "there",
    bypassLocking: bypassProgressGatingForEmail(user.email ?? ""),
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-border pb-7">
        <p className="text-sm font-medium text-muted-foreground">My learning</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">My courses</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Open an assigned course, continue your current chapter, or review completed work.
        </p>
      </header>

      {model.courses.length > 0 ? (
        <div className="mt-8">
          <MenteeCourseList courses={model.courses} showHeading={false} />
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
          <BookOpenText className="size-8 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">No courses assigned yet</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Enroll from the catalog or accept a mentor invite — assigned courses show up here too.
          </p>
          <Link href="/catalog" className={buttonVariants({ className: "mt-6" })}>
            Browse catalog
          </Link>
        </div>
      )}
    </div>
  );
}
