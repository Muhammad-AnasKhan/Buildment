import Link from "next/link";
import { prisma } from "@/server/db";
import { CourseCard } from "@/components/marketing/course-card";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { StepsVisual } from "@/components/marketing/steps-visual";
import { Logo } from "@/components/brand/logo";
import { GlassNavShell } from "@/components/glass-nav-shell";
import { ArrowRight } from "lucide-react";

const FEATURES = [
  {
    title: "Interactive chapters",
    description:
      "Each lesson blends clear explanations with hands-on checkpoints — quizzes, coding exercises, and prompts that keep you engaged.",
  },
  {
    title: "Project-based learning",
    description:
      "Build something real as you learn. Every course is structured around a concrete project, not abstract theory.",
  },
  {
    title: "Progress tracking",
    description:
      "Your progress is saved automatically. See exactly where you are and what's next at a glance.",
  },
  {
    title: "Mentor reviews",
    description:
      "Get personalized feedback from mentors on your open-ended answers and code submissions.",
  },
  {
    title: "Structured curriculum",
    description:
      "Courses are organized into modules and chapters, so you always know what to learn next.",
  },
  {
    title: "Learn at your pace",
    description:
      "No deadlines, no pressure. Move through the material at whatever speed works for you.",
  },
];

const STEPS = [
  { label: "Create your account", description: "Sign up in seconds with email or Google." },
  { label: "Browse courses", description: "Explore the catalog of project-based courses." },
  {
    label: "Work through chapters",
    description: "Read, build, and complete interactive checkpoints.",
  },
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
    <div className="flex min-h-full flex-1 flex-col bg-white text-neutral-900">
      <GlassNavShell>
        <Link href="/">
          <Logo size="sm" />
        </Link>
        <Link
          href="/login"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Log in
        </Link>
      </GlassNavShell>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center sm:pt-32">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
            Learn by building, one chapter at a time.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-neutral-500">
            Structured, project-based courses with interactive checkpoints. Learn through
            practice — not passive reading.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-neutral-900 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Start learning
              <ArrowRight className="size-4" />
            </Link>
            {courses.length > 0 && (
              <Link
                href="#courses"
                className="inline-flex h-11 items-center rounded-lg border border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Browse courses
              </Link>
            )}
          </div>
        </section>

        {/* Courses */}
        {courses.length > 0 ? (
          <section id="courses" className="border-t border-neutral-200 py-20">
            <div className="mx-auto max-w-5xl px-6">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                Available courses
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
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
        <section className="border-t border-neutral-200 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900">
              How it works
            </h2>
            <div className="mt-10">
              <StepsVisual steps={STEPS} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-neutral-200 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900">
              Built for how you learn best
            </h2>
            <div className="mt-10">
              <FeatureGrid features={FEATURES} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
          <Logo size="sm" />
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} buildment. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
