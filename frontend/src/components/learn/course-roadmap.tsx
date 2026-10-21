import { ChevronDown } from "lucide-react";
import { MARKETPLACE_WEEKS } from "@/lib/marketplace-weeks";
import type { CatalogCourseDetail } from "@/shared/api/catalog";

const WEEK_DETAILS = [
  {
    focus: "Set up the client and API, connect MongoDB, and design the marketplace data model.",
    demo: "Both apps run. The API reports healthy, and MongoDB contains the seeded shops and products.",
  },
  {
    focus: "Add authentication, ownership rules, shop setup, product management, and photo uploads.",
    demo: "A vendor opens a shop and lists a product with a photo. A second vendor is blocked from its data.",
  },
  {
    focus: "Create the catalogue, cart, split checkout, Stripe test payment, and order tracking.",
    demo: "One cart with products from two shops becomes two orders after a single test checkout.",
  },
  {
    focus: "Add Redis caching and search, ship background jobs, deploy the marketplace, prevent overselling with inventory reservations, and validate promotions on the server.",
    demo: "The live marketplace survives a restart, concurrent checkouts cannot oversell the last unit, and server-calculated promotions match the Stripe test payment.",
  },
] as const;
const WEEKS = MARKETPLACE_WEEKS.map((week, index) => ({ ...week, ...WEEK_DETAILS[index] }));

type CourseModule = CatalogCourseDetail["modules"][number];

function modulesInRange(modules: CourseModule[], from: number, to: number) {
  return modules.filter((module) => module.order >= from && module.order <= to && module.chapters.length > 0);
}

function ModuleDisclosure({ module }: { module: CourseModule }) {
  return (
    <details className="group/module rounded-lg border bg-background">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-3 hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1"><span className="block text-sm font-medium">Module {String(module.order).padStart(2, "0")}: {module.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{module.chapters.length} lessons</span></span>
        <span className="shrink-0 text-xs text-muted-foreground group-open/module:hidden">View lessons</span>
        <span className="hidden shrink-0 text-xs text-muted-foreground group-open/module:inline">Hide lessons</span>
      </summary>
      <ol className="divide-y border-t px-3 pl-14">
        {module.chapters.map((chapter) => (
          <li key={chapter.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
            <span className="min-w-0 leading-5"><span className="mr-2 font-mono text-[11px] tabular-nums text-muted-foreground">{module.order}.{String(chapter.order).padStart(2, "0")}</span>{chapter.title}</span>
            {chapter.estimatedMinutes ? <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">{chapter.estimatedMinutes} min</span> : null}
          </li>
        ))}
      </ol>
    </details>
  );
}

export function CourseRoadmap({ modules }: { modules: CourseModule[] }) {
  const closing = modules.find((module) => module.order === 99 && module.chapters.length > 0);
  const additional = modules.filter((module) => module.order !== 99 && !MARKETPLACE_WEEKS.some((week) => module.order >= week.from && module.order <= week.to) && module.chapters.length > 0);

  return (
    <section aria-labelledby="roadmap-title" className="overflow-hidden rounded-2xl border bg-card">
      <header className="border-b px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Explore the syllabus</p>
            <h2 id="roadmap-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Course curriculum</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Open a week to see its modules, then open a module to browse the lessons and checkpoints.</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3">
            <span><span className="block text-sm font-semibold">4-week core</span><span className="block text-xs text-muted-foreground">About 240 hours</span></span>
          </div>
        </div>
      </header>

      <div className="space-y-3 px-5 py-4 sm:px-8 sm:py-5">
        {WEEKS.map(({ number, title, focus, demo, from, to }) => {
          const included = modulesInRange(modules, from, to);
          const lessonCount = included.reduce((count, module) => count + module.chapters.length, 0);
          return (
            <details key={number} className="group/week overflow-hidden rounded-xl border bg-card shadow-sm">
              <summary className="flex min-h-[68px] cursor-pointer list-none items-center gap-4 px-4 py-4 hover:bg-muted/30 sm:px-5 [&::-webkit-details-marker]:hidden">
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/week:rotate-180" aria-hidden />
                <h3 className="min-w-0 flex-1 text-sm font-semibold tracking-tight sm:text-base">Week {number} - {title}</h3>
                <span className="max-w-[45%] shrink-0 text-right text-xs leading-5 text-muted-foreground sm:max-w-none sm:text-sm">{included.length} modules · {lessonCount} lessons · about 60 hours</span>
              </summary>
              <div className="border-t bg-muted/15 px-4 py-4 sm:px-5 sm:py-5">
                <p className="mb-4 max-w-3xl text-sm leading-6 text-muted-foreground">{focus}</p>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.8fr)]">
                  <div className="space-y-2">
                    {included.length ? included.map((module) => <ModuleDisclosure key={module.id} module={module} />) : <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Modules for this week are coming soon.</p>}
                  </div>
                  <aside className="h-fit rounded-xl border bg-card p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">End-of-week demo</p>
                    <p className="mt-2 text-sm leading-6">{demo}</p>
                  </aside>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {closing ? (
        <details className="group/closing border-t">
          <summary className="group/closing flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-muted/20 sm:px-8 sm:py-5 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1"><span className="block text-base font-semibold">Finish and present · {closing.title}</span><span className="mt-1 block text-xs text-muted-foreground">Document, demo, and defend your project.</span></span>
            <span className="shrink-0 text-xs text-muted-foreground group-open/closing:hidden">View project</span>
            <span className="hidden shrink-0 text-xs text-muted-foreground group-open/closing:inline">Hide project</span>
          </summary>
          <div className="border-t bg-muted/10 p-4 sm:px-8 sm:py-5"><ModuleDisclosure module={closing} /></div>
        </details>
      ) : null}
      {additional.length > 0 ? (
        <details className="group/additional border-t">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 hover:bg-muted/20 sm:px-8 sm:py-5 [&::-webkit-details-marker]:hidden">
            <span className="text-base font-semibold">Additional modules</span>
            <span className="text-xs text-muted-foreground">{additional.length} modules</span>
          </summary>
          <div className="space-y-2 border-t bg-muted/10 p-4 sm:px-8 sm:py-5">{additional.map((module) => <ModuleDisclosure key={module.id} module={module} />)}</div>
        </details>
      ) : null}
    </section>
  );
}
