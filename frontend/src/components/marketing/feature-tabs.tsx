import type { CatalogCourseSummary } from "@/shared/api/catalog";
import { plainDashes } from "@/components/marketing/course-card";
import styles from "./landing.module.css";

/** A real assignment replaces the simulated feature dashboard. */
export function MentorNote({ course }: { course?: CatalogCourseSummary }) {
  return (
    <section id="why" aria-labelledby="mentor-heading" className="scroll-mt-32 border-y border-border bg-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-12 lg:py-24">
        <div>
          <p className={styles.eyebrow}>Beyond the code</p>
          <h2 id="mentor-heading" className="mt-5 font-serif text-4xl leading-[1.12] sm:text-5xl">
            Your ideas need<br />a voice, too.
          </h2>
          <p className="mt-6 max-w-sm text-base leading-7">
            Writing the code is part of the work. Explaining a decision or giving a teammate useful feedback takes practice too.
          </p>
        </div>
        <div className="lg:pt-2">
          {course?.projectGoal ? (
            <>
              <p className="text-xs text-muted-foreground">An assignment from {plainDashes(course.title)}</p>
              <blockquote className="mt-5 border-l-2 border-current pl-6 font-serif text-2xl leading-relaxed sm:text-3xl">
                &ldquo;{plainDashes(course.projectGoal)}&rdquo;
              </blockquote>
            </>
          ) : null}
          <p className="mt-7 max-w-lg text-base leading-7">
            You bring your work to a mentor. The review is a chance to explain your choices, find what needs attention and try again.
          </p>
          <p className={`mt-5 font-serif text-xl italic ${styles.accent}`}>You do not have to get it right the first time.</p>
        </div>
      </div>
    </section>
  );
}
