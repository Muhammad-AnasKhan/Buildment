import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogCourseSummary } from "@/shared/api/catalog";
import { serverApiFetch } from "@/lib/api-server";
import { Logo } from "@/components/brand/logo";
import { CourseCatalog } from "@/components/marketing/course-catalog";
import { FeatureTabs } from "@/components/marketing/feature-tabs";
import { HeroStats, type HeroStat } from "@/components/marketing/hero-stats";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { LandingHeader } from "@/components/marketing/landing-header";
import { ProductFrame } from "@/components/marketing/product-frame";
import { SectionHeader } from "@/components/marketing/section-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECTION = "px-4 py-16 sm:px-6 lg:px-8 lg:py-[84px]";

function courseCatalogDescription(courseCount: number): string {
  if (courseCount === 0) return "";
  const noun = courseCount === 1 ? "course" : "courses";
  return `${courseCount} published ${noun}. Sign in to enroll in a course, follow each chapter at your own pace, and track your progress as you move forward.`;
}

export default async function MarketingHomePage() {
  // Public catalog, fetched anonymously so the landing page renders the same for everyone.
  const { courses } = await serverApiFetch<{ courses: CatalogCourseSummary[] }>(
    "/api/v1/catalog",
    { token: null },
  );

  // Hero stats come straight from the catalog, so they can never drift from the real numbers.
  const totalHours = courses.reduce(
    (sum, c) => sum + (c.estimatedHours ?? 0),
    0,
  );
  const stats: HeroStat[] = [
    {
      value: courses.reduce((sum, c) => sum + c.chapterCount, 0),
      label: "chapters",
    },
    {
      value: courses.reduce((sum, c) => sum + c.moduleCount, 0),
      label: "modules",
    },
    { value: totalHours, label: "of building", suffix: "h" },
  ].filter((stat) => stat.value > 0);

  // The "Choose a course" scene in How it works shows real courses (up to three).
  const sceneCourses = courses.slice(0, 3).map((course) => ({
    title: course.title,
    meta: [
      `${course.moduleCount} ${course.moduleCount === 1 ? "module" : "modules"}`,
      course.estimatedHours !== null ? `${course.estimatedHours}h` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    coverUrl: course.coverUrl,
  }));

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <LandingHeader showCourses={courses.length > 0} />

      <main className="flex-1">
        {/* Hero: copy left, product preview right */}
        <section aria-labelledby="hero-heading">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-8 lg:py-20">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Buildment
              </p>
              <h1
                id="hero-heading"
                className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
              >
                Learn by building{" "}
                <span className="bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                  real projects
                </span>
              </h1>
              <p className="mt-5 max-w-[46ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Learn through interactive courses that guide you from setup to
                deployment with practical lessons, hands on exercises, and
                mentor feedback.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {courses.length > 0 ? (
                  <a
                    href="#courses"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-11 gap-2 px-5 text-[0.95rem]",
                    )}
                  >
                    Browse courses
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({
                      variant: courses.length > 0 ? "outline" : "default",
                      size: "lg",
                    }),
                    "h-11 gap-2 px-5 text-[0.95rem]",
                  )}
                >
                  Sign in
                  {courses.length === 0 ? (
                    <ArrowRight className="size-4" aria-hidden="true" />
                  ) : null}
                </Link>
              </div>

              <HeroStats stats={stats} />
            </div>
            <ProductFrame />
          </div>
        </section>

        {/* Catalog */}
        {courses.length > 0 ? (
          <section
            id="courses"
            className={cn("scroll-mt-16 border-t border-border", SECTION)}
            aria-labelledby="courses-heading"
          >
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                headingId="courses-heading"
                label="Explore"
                title="Course catalog"
                description={courseCatalogDescription(courses.length)}
                className="mb-9"
              />

              <CourseCatalog
                courses={courses.map((course) => ({
                  id: course.id,
                  slug: course.slug,
                  title: course.title,
                  description: course.description,
                  projectGoal: course.projectGoal,
                  coverUrl: course.coverUrl,
                  difficulty: course.difficulty,
                  estimatedHours: course.estimatedHours,
                  moduleCount: course.moduleCount,
                  chapterCount: course.chapterCount,
                }))}
              />
            </div>
          </section>
        ) : null}

        {/* Features: tabs left, panel right */}
        <section
          id="why"
          className={cn("scroll-mt-16 border-t border-border", SECTION)}
          aria-labelledby="why-heading"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              headingId="why-heading"
              label="Features"
              title="Learning that goes beyond theory"
              description="Combine lessons, practical exercises, and mentor feedback in one place to build real skills through real projects."
              className="mb-9"
            />
            <FeatureTabs />
          </div>
        </section>

        {/* How it works: timeline left, stage right */}
        <section
          id="work"
          className={cn(
            "scroll-mt-16 border-t border-border bg-muted/20",
            SECTION,
          )}
          aria-labelledby="work-heading"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              headingId="work-heading"
              label="How it works"
              title="Three simple steps to get started"
              description="Follow a clear learning path, practice your skills, and get guidance from mentors along the way."
              className="mb-9"
            />
            <HowItWorks courses={sceneCourses} />
          </div>
        </section>

        {/* CTA: full-width inverted block */}
        <section
          className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-[84px]"
          aria-labelledby="cta-heading"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 rounded-[28px] bg-foreground p-8 text-background sm:p-12 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="text-sm font-medium opacity-70">Get started</p>
              <h2
                id="cta-heading"
                className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Sign in and choose your course
              </h2>
              <p className="mt-3 text-sm leading-6 opacity-75 sm:text-base">
                Create an account or sign in to start learning, track your
                progress, and continue where you left off.
              </p>
            </div>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 shrink-0 gap-2 bg-background px-5 text-[0.95rem] text-foreground hover:bg-background/90",
              )}
            >
              Sign in
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DevWeekends. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
