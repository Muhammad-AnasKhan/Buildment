import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  ChartNoAxesCombined,
  MessageSquareText,
} from "lucide-react";
import type { CatalogCourseSummary } from "@/shared/api/catalog";
import { serverApiFetch } from "@/lib/api-server";
import { Logo } from "@/components/brand/logo";
import { CourseCard } from "@/components/marketing/course-card";
import { LandingHeader } from "@/components/marketing/landing-header";
import { ProductFrame } from "@/components/marketing/product-frame";
import { SectionHeader } from "@/components/marketing/section-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Choose a course",
    text: "Browse published project courses and sign in to enroll.",
  },
  {
    title: "Work through chapters",
    text: "Read lessons, complete exercises, and submit answers at each step.",
  },
  {
    title: "Ship the project",
    text: "Finish with a working product and a clear record of what you built.",
  },
];

const VALUE_PROPS = [
  {
    icon: BookOpenCheck,
    title: "One project per course",
    text: "Every chapter moves the same codebase forward instead of isolated tutorials.",
  },
  {
    icon: MessageSquareText,
    title: "Help in context",
    text: "Questions and mentor replies stay tied to the course and chapter you are on.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress you can see",
    text: "Completion, reviews, and activity show what is done and what needs attention.",
  },
];

function courseCatalogDescription(courseCount: number): string {
  if (courseCount === 0) return "";
  const noun = courseCount === 1 ? "course" : "courses";
  return `${courseCount} published ${noun}. Sign in to enroll and follow the path chapter by chapter.`;
}

export default async function MarketingHomePage() {
  // Public catalog, fetched anonymously so the landing page renders the same for everyone.
  const { courses } = await serverApiFetch<{ courses: CatalogCourseSummary[] }>("/api/v1/catalog", { token: null });

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <LandingHeader showCourses={courses.length > 0} />

      <main className="flex-1">
        <section className="border-b border-border" aria-labelledby="hero-heading">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
            <div className="max-w-xl">
              <SectionHeader
                as="h1"
                headingId="hero-heading"
                label="Buildment"
                title="Learn by building real projects"
                description="Interactive courses guide you through one codebase—from setup to deploy—with lessons, exercises, and mentor feedback along the way."
              />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {courses.length > 0 ? (
                  <a
                    href="#courses"
                    className={cn(buttonVariants({ size: "lg" }), "h-10 gap-2 px-4")}
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
                    "h-10 gap-2 px-4",
                  )}
                >
                  Sign in
                  {courses.length === 0 ? (
                    <ArrowRight className="size-4" aria-hidden="true" />
                  ) : null}
                </Link>
              </div>
            </div>
            <ProductFrame />
          </div>
        </section>

        {courses.length > 0 ? (
          <section
            id="courses"
            className="scroll-mt-16 border-b border-border"
            aria-labelledby="courses-heading"
          >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
              <SectionHeader
                headingId="courses-heading"
                label="Explore"
                title="Course catalog"
                description={courseCatalogDescription(courses.length)}
                className="border-b border-border pb-7"
              />
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      slug: course.slug,
                      title: course.title,
                      description: course.description,
                      projectGoal: course.projectGoal,
                      coverUrl: course.coverUrl,
                      difficulty: course.difficulty,
                      estimatedHours: course.estimatedHours,
                      moduleCount: course.moduleCount,
                      chapterCount: course.chapterCount,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section
          id="why"
          className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14"
          aria-labelledby="why-heading"
        >
          <SectionHeader
            headingId="why-heading"
            label="Features"
            title="Built for project-based learning"
            description="Instruction, hands-on work, and feedback live in the same course—not in separate tools."
            className="border-b border-border pb-7"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {VALUE_PROPS.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:p-6"
              >
                <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/40">
                  <item.icon className="size-4 text-foreground" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="work"
          className="border-t border-border bg-muted/20"
          aria-labelledby="work-heading"
        >
          <div className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
              <SectionHeader
                headingId="work-heading"
                label="How it works"
                title="Three steps to get started"
                description="Learners follow a clear path. Mentors author courses and review work from one workspace."
              />
              <ol className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-4 p-5 sm:p-6">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 text-sm font-medium tabular-nums text-muted-foreground"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16" aria-labelledby="cta-heading">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card px-6 py-8 shadow-sm sm:px-8 lg:flex-row lg:items-center">
            <SectionHeader
              as="h2"
              headingId="cta-heading"
              label="Get started"
              title="Sign in and pick a course"
              description="Create an account or sign in to enroll, track progress, and continue where you left off."
              className="max-w-xl"
            />
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "h-10 shrink-0 gap-2 px-4")}
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
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
