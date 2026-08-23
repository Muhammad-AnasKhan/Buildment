import Link from "next/link";
import { prisma } from "@/server/db";
import { CourseCard } from "@/components/marketing/course-card";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { StepsVisual } from "@/components/marketing/steps-visual";
import { Logo } from "@/components/brand/logo";
import { GlassNavShell } from "@/components/glass-nav-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, Clock, Layers, Rocket, ShieldCheck, Users } from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Interactive chapters",
    description: "Each lesson blends clear explanations with hands-on checkpoints — quizzes, coding exercises, and reflective prompts that keep you engaged.",
  },
  {
    icon: Rocket,
    title: "Project-based learning",
    description: "Build something real as you learn. Every course is structured around a concrete project, not abstract theory.",
  },
  {
    icon: ShieldCheck,
    title: "Progress tracking",
    description: "Your progress is automatically saved and visualized. See exactly where you are and what's next at a glance.",
  },
  {
    icon: Users,
    title: "Mentor reviews",
    description: "Get personalized feedback from mentors on your open-ended answers and code submissions.",
  },
  {
    icon: Layers,
    title: "Structured curriculum",
    description: "Courses are organized into modules and chapters, so you always know what to learn next.",
  },
  {
    icon: Clock,
    title: "Learn at your pace",
    description: "No deadlines, no pressure. Move through the material at whatever speed works for you.",
  },
];

const STEPS = [
  { label: "Create your account", description: "Sign up in seconds with email or Google." },
  { label: "Browse courses", description: "Explore our catalog of project-based courses." },
  { label: "Work through chapters", description: "Read, build, and complete interactive checkpoints." },
  { label: "Get feedback", description: "Submit work and receive mentor reviews." },
];

export default async function MarketingHomePage() {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverUrl: true,
      difficulty: true,
      estimatedHours: true,
      _count: { select: { modules: true, chapters: true } },
    },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-neutral-950">
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.08),transparent)]"
        aria-hidden
      />

      {/* Nav */}
      <GlassNavShell>
        <Link href="/">
          <Logo size="sm" />
        </Link>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ size: "sm" }),
            "rounded-full bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800"
          )}
        >
          Log in
        </Link>
      </GlassNavShell>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28 md:py-36">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">
              <span className="size-1.5 rounded-full bg-indigo-600" aria-hidden />
              Interactive learning platform
            </p>
            <h1 className="mx-auto mt-8 max-w-3xl text-[2.5rem] font-bold leading-[1.1] tracking-[-0.03em] sm:text-5xl md:text-[3.5rem]">
              Learn by building,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                one chapter
              </span>{" "}
              at a time.
            </h1>
            <p className="mx-auto mt-8 max-w-lg text-lg leading-[1.7] text-neutral-600">
              Structured, project-based courses with interactive checkpoints. Learn through practice — not passive reading.
            </p>
            <div className="mt-12 flex items-center justify-center gap-4">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-full bg-neutral-950 px-8 text-sm font-semibold text-white shadow-md shadow-neutral-900/10 hover:bg-neutral-800"
                )}
              >
                Start learning
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#courses"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 rounded-full border-neutral-300 px-8 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                )}
              >
                Browse courses
              </Link>
            </div>
          </div>
        </section>

        {/* Course Showcase */}
        {courses.length > 0 ? (
          <section id="courses" className="border-t border-neutral-200 bg-neutral-50/50 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-6 sm:px-8">
              <div className="mb-12 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Available courses</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                  Start your learning journey
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      slug: course.slug,
                      title: course.title,
                      description: course.description,
                      coverUrl: course.coverUrl,
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

        {/* How it works */}
        <section className="border-t border-neutral-200 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">How it works</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                Four simple steps
              </h2>
            </div>
            <StepsVisual steps={STEPS} />
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-neutral-200 bg-neutral-50/50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Why buildment</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                Built for how you learn best
              </h2>
            </div>
            <FeatureGrid features={FEATURES} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 sm:px-8">
          <Logo size="sm" />
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} buildment. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
