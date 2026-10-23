import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CatalogCourseSummary } from "@/shared/api/catalog";
import { BUILD_OUTLINE } from "@/components/marketing/marketing-content";
import { courseHref, plainDashes } from "@/components/marketing/course-card";
import styles from "./landing.module.css";

export function FeaturedProject({ course }: { course: CatalogCourseSummary }) {
  return (
    <section id="project" aria-labelledby="project-heading" className="border-y border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:px-12 lg:py-20">
        <div>
          <p className={styles.eyebrow}>Inside the long build</p>
          <h2 id="project-heading" className="mt-5 font-serif text-5xl tracking-tight sm:text-6xl">FreshMarket</h2>
          <p className="mt-2 text-xl">Many local shops. One working marketplace.</p>
          <p className="mt-6 max-w-lg text-base leading-7">{plainDashes(course.projectGoal ?? course.description ?? "")}</p>
          <p className="mt-6 font-mono text-xs leading-6 text-muted-foreground">
            {course.estimatedHours !== null ? `${course.estimatedHours} estimated hours / ` : ""}{course.moduleCount} modules / {course.chapterCount} chapters
          </p>
          <Link href={courseHref(course.slug)} className={`mt-5 inline-flex min-h-11 items-center gap-2 font-medium underline underline-offset-4 ${styles.accent}`}>
            View FreshMarket <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div>
          <p className="mb-5 text-xs text-muted-foreground">From the course outline</p>
          <ol className="border-t border-border">
            {BUILD_OUTLINE.map((item, index) => (
              <li key={item.title} className="grid grid-cols-[2rem_1fr] gap-4 border-b border-border py-5">
                <span className={`pt-1 font-mono text-xs ${styles.accent}`}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 font-serif text-lg italic">At the end: a live link you can show an employer, with code you can explain.</p>
        </div>
      </div>
    </section>
  );
}
