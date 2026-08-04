import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { GlassNavShell } from "@/components/glass-nav-shell";

const FEATURES = [
  {
    title: "Guided chapters",
    description:
      "Courses split into clear steps. Read a section, complete the checkpoint, then continue.",
  },
  {
    title: "Interactive checkpoints",
    description:
      "Quizzes, exercises, and confirmations so you know the material before moving on.",
  },
  {
    title: "Project-based learning",
    description:
      "Each course builds toward something concrete — not just documentation to skim.",
  },
] as const;

const STEPS = [
  "Open a course",
  "Work through each chapter",
  "Complete the checkpoints",
  "Finish with a built project",
] as const;

export function LandingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-neutral-50 text-neutral-950">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.1),transparent)]"
        aria-hidden
      />
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

      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-28 md:py-32">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">
            <span className="size-1.5 rounded-full bg-indigo-600" aria-hidden />
            Interactive courses
          </p>
          <h1 className="mt-8 max-w-2xl text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] sm:text-5xl md:text-[3.25rem]">
            Learn by building, one chapter at a time.
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-[1.7] text-neutral-600">
            Structured guides with hands-on exercises for students and developers who want to
            learn through practice — not passive reading.
          </p>
          <div className="mt-12">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full bg-neutral-950 px-8 text-sm font-medium text-white hover:bg-neutral-800"
              )}
            >
              Start learning
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-24">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
              What you get
            </h2>
            <ul className="mt-12 grid gap-14 sm:grid-cols-3 sm:gap-10">
              {FEATURES.map(({ title, description }, index) => (
                <li key={title}>
                  <p className="font-mono text-xs tabular-nums text-neutral-400">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-base font-semibold leading-snug tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.65] text-neutral-600">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Flow */}
        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-24">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
              How it works
            </h2>
            <ol className="mt-12 max-w-xl space-y-0">
              {STEPS.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-6 border-b border-neutral-200 py-5 last:border-b-0"
                >
                  <span className="w-6 shrink-0 font-mono text-sm tabular-nums text-neutral-400">
                    {index + 1}
                  </span>
                  <span className="text-[15px] font-medium leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
          <Logo size="sm" />
        </div>
      </footer>
    </div>
  );
}
