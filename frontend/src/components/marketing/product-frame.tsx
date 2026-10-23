import { COURSE_EXCERPT } from "@/components/marketing/marketing-content";
import styles from "./landing.module.css";

export function ProductFrame() {
  return (
    <figure className={styles.notebook} aria-labelledby="excerpt-heading">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border pb-4 text-xs text-muted-foreground">
        <span>A page from the course</span>
        <span className="font-mono">01.06</span>
      </figcaption>
      <h2 id="excerpt-heading" className="mt-7 max-w-[15ch] font-serif text-3xl leading-tight sm:text-4xl">
        What happens when a price changes?
      </h2>
      <div className="my-7 grid grid-cols-2 gap-4 border-y border-border py-5" aria-label="The product price can change. The order receipt stays the same.">
        <div>
          <p className="text-xs text-muted-foreground">Product price</p>
          <p className="mt-2 font-mono text-sm">can change</p>
        </div>
        <div className="border-l border-border pl-4">
          <p className="text-xs text-muted-foreground">Order receipt</p>
          <p className={`mt-2 font-mono text-sm ${styles.accent}`}>stays the same</p>
        </div>
      </div>
      <blockquote className="text-[15px] leading-7 text-foreground">
        &ldquo;{COURSE_EXCERPT.quote}&rdquo;
      </blockquote>
      <p className="mt-4 text-xs text-muted-foreground">{COURSE_EXCERPT.source}</p>
      <details className="mt-6 border-t border-border pt-1">
        <summary className="cursor-pointer py-3 text-sm font-medium underline underline-offset-4">Read the reasoning</summary>
        <p className="pb-3 text-sm leading-6">{COURSE_EXCERPT.explanation}</p>
      </details>
      <p className={styles.marginNote}>A working screen is only half the answer.</p>
    </figure>
  );
}
