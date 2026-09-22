import Link from "next/link";
import { prisma } from "@/server/db";
import { Logo } from "@/components/brand/logo";
import { CourseCard } from "@/components/marketing/course-card";
import { LandingHeader } from "@/components/marketing/landing-header";
import { ProductFrame } from "@/components/marketing/product-frame";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    index: "01",
    title: "Write",
    text: "A chapter is the lesson and the checkpoints in it. Quizzes, short answers, and gates sit in the prose, in order.",
  },
  {
    index: "02",
    title: "Work",
    text: "Mentees start a clock and move through the course one chapter at a time. The next module stays closed until the gate is done.",
  },
  {
    index: "03",
    title: "Review",
    text: "An open answer comes back with the question and the text they wrote. You read the submission, not a percentage.",
  },
];

export default async function MarketingHomePage() {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      difficulty: true,
      estimatedHours: true,
      projectGoal: true,
      _count: { select: { modules: true, chapters: true } },
    },
    orderBy: { title: "asc" },
  });

  const totals = courses.reduce(
    (sum, course) => ({
      modules: sum.modules + course._count.modules,
      chapters: sum.chapters + course._count.chapters,
      hours: sum.hours + (course.estimatedHours ?? 0),
    }),
    { modules: 0, chapters: 0, hours: 0 },
  );

  const stats = [
    { label: "Courses", value: courses.length },
    { label: "Modules", value: totals.modules },
    { label: "Chapters", value: totals.chapters },
    { label: "Hours", value: totals.hours },
  ].filter((stat) => stat.value > 0);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <LandingHeader showCourses={courses.length > 0} />

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 lg:pb-20 lg:pt-20">
          <div>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.05]">
              Write the course.
              <br />
              Read the work.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Mentors publish chapters. Mentees answer the checkpoints before they continue. You see the submission.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}>
                Log in
              </Link>
              {courses.length > 0 ? (
                <a
                  href="#courses"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-4")}
                >
                  View courses
                </a>
              ) : null}
            </div>
          </div>
          <ProductFrame />
        </section>

        {stats.length > 0 ? (
          <section className="border-y border-border" aria-label="Course size">
            <dl className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn(
                    "border-border px-6 py-7",
                    index % 2 === 1 && "border-l",
                    index >= 2 && "border-t sm:border-t-0",
                    index > 0 && "sm:border-l",
                  )}
                >
                  <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-2 font-mono text-2xl tabular-nums tracking-tight text-foreground">
                    {stat.value.toLocaleString()}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section id="work" className="mx-auto max-w-6xl scroll-mt-16 px-6 py-16 lg:py-20">
          <div className="max-w-lg">
            <h2 className="text-2xl font-semibold tracking-tight">How a chapter moves</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The same path for every module: the lesson, the work, then the review.
            </p>
          </div>
          <ol className="mt-10 grid overflow-hidden rounded-xl border border-border sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.index}
                className={cn(
                  "bg-card p-6 sm:p-7",
                  index > 0 && "border-t border-border sm:border-t-0 sm:border-l",
                )}
              >
                <p className="font-mono text-xs tabular-nums text-muted-foreground">{step.index}</p>
                <h3 className="mt-5 text-base font-medium text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {courses.length > 0 ? (
          <section id="courses" className="scroll-mt-16 border-t border-border">
            <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
              <h2 className="text-2xl font-semibold tracking-tight">Courses</h2>
              <div className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      slug: course.slug,
                      title: course.title,
                      description: course.description,
                      projectGoal: course.projectGoal,
                      difficulty: course.difficulty,
                      estimatedHours: course.estimatedHours,
                      moduleCount: course._count.modules,
                      chapterCount: course._count.chapters,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
