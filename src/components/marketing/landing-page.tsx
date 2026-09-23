import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  ChartNoAxesCombined,
  MessageSquareText,
} from "lucide-react";
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
    title: "Design the path",
    text: "Turn your expertise into focused MDX chapters with quizzes, reflections, runnable exercises, and clear gates.",
  },
  {
    index: "02",
    title: "Learn by shipping",
    text: "Mentees build one real project, prove each concept at the moment it matters, and always know what comes next.",
  },
  {
    index: "03",
    title: "See the understanding",
    text: "Review the actual work, answer help requests, and spot where the cohort is stuck before anyone quietly falls behind.",
  },
];

const VALUE_PROPS = [
  {
    icon: BookOpenCheck,
    eyebrow: "Learning that moves",
    title: "Every chapter asks for proof",
    text: "Reading, building, and reflection live in one flow. Progress comes from completed work—not a scrolled page.",
  },
  {
    icon: MessageSquareText,
    eyebrow: "Feedback in context",
    title: "Mentor the work, not the dashboard",
    text: "Open responses and help notes arrive with the course and chapter attached, ready for a useful reply.",
  },
  {
    icon: ChartNoAxesCombined,
    eyebrow: "Signals you can trust",
    title: "Know who needs you",
    text: "Real completion, study activity, pending reviews, and confusion signals make the next mentor action obvious.",
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
    { label: "published course", value: courses.length },
    { label: "modules", value: totals.modules },
    { label: "hands-on lessons", value: totals.chapters },
    { label: "guided hours", value: totals.hours },
  ].filter((stat) => stat.value > 0);

  return (
    <div className="flex min-h-full flex-1 flex-col overflow-hidden bg-background text-foreground">
      <LandingHeader showCourses={courses.length > 0} />

      <main className="flex-1">
        <section className="border-b border-border" aria-labelledby="hero-heading">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(34rem,1.14fr)] lg:gap-14 lg:px-8 lg:py-18 xl:gap-20 xl:py-20">
            <div className="max-w-2xl lg:max-w-xl">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Buildment / guided project learning
              </p>
              <h1
                id="hero-heading"
                className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-foreground sm:text-6xl lg:text-[4rem]"
              >
                Make the project the course.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Each lesson moves one real codebase forward. Mentees show their thinking as they
                build; mentors see exactly where to step in.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {courses.length > 0 ? (
                  <a
                    href="#courses"
                    className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-5")}
                  >
                    Explore the course <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
                <Link
                  href="/login"
                  className="rounded-sm px-1 py-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Mentor sign in
                </Link>
              </div>
              <div className="mt-9 grid max-w-xl gap-4 border-t border-border pt-5 text-sm leading-6 text-muted-foreground sm:grid-cols-2 sm:gap-8">
                <p>
                  <span className="block font-medium text-foreground">For learners</span>
                  One project and a clear next step.
                </p>
                <p>
                  <span className="block font-medium text-foreground">For mentors</span>
                  Real work, ready to review.
                </p>
              </div>
            </div>
            <ProductFrame />
          </div>
        </section>

        {stats.length > 0 ? (
          <section className="border-b border-border bg-muted/20" aria-label="Published course overview">
            <dl className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:grid-cols-4 sm:px-6 lg:px-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn(
                    "border-border px-3 py-6 sm:px-6 lg:py-7",
                    index % 2 === 1 && "border-l",
                    index >= 2 && "border-t sm:border-t-0",
                    index > 0 && "sm:border-l",
                  )}
                >
                  <dd className="font-mono text-2xl tabular-nums tracking-tight text-foreground sm:text-3xl">
                    {stat.value.toLocaleString()}
                  </dd>
                  <dt className="mt-1 text-xs capitalize text-muted-foreground sm:text-sm">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section id="why" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24" aria-labelledby="why-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Built for the learning loop</p>
            <h2 id="why-heading" className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">The space between reading and shipping.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">Buildment keeps instruction, practice, proof, and human feedback connected from the first chapter to the final release.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {VALUE_PROPS.map((item) => (
              <article key={item.title} className="rounded-xl border border-border bg-card p-6 sm:p-7">
                <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background"><item.icon className="size-5" aria-hidden="true" /></div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.eyebrow}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        {courses.length > 0 ? (
          <section id="courses" className="scroll-mt-16 border-y border-border bg-muted/20" aria-labelledby="courses-heading">
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Start with a real product</p>
                <h2 id="courses-heading" className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">One codebase. Every important decision.</h2>
              </div>
              <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
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

        <section id="work" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24" aria-labelledby="work-heading">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
            <div className="max-w-md lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">How it works</p>
              <h2 id="work-heading" className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">A clear path from expertise to evidence.</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">No disconnected quiz tool. No progress theater. The learning experience and the mentor’s view are two sides of the same work.</p>
            </div>
            <ol className="divide-y divide-border border-y border-border">
              {STEPS.map((step) => (
                <li key={step.index} className="grid gap-3 py-6 sm:grid-cols-[3rem_9rem_1fr] sm:items-start sm:gap-5 sm:py-8">
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">{step.index}</p>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24" aria-labelledby="cta-heading">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-2xl bg-foreground px-6 py-9 text-background sm:px-10 sm:py-11 lg:flex-row lg:items-center lg:px-12">
            <div><p className="text-sm text-background/60">Ready to make learning visible?</p><h2 id="cta-heading" className="mt-2 max-w-2xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Build something real. Prove what you learned.</h2></div>
            <Link href="/login" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-11 gap-2 px-5")}>Enter buildment <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-7 sm:px-6 lg:px-8">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
