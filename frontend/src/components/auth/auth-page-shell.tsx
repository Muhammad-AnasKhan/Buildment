import Link from "next/link";
import type { ReactNode } from "react";
import { Dot, type DotMood } from "@/components/brand/dot";
import { Wordmark } from "@/components/brand/wordmark";
import { HeroQuestion } from "@/components/marketing/edorax/hero-question";
import { ThemeToggle } from "@/components/theme-toggle";

const THEME_BUTTON =
  "grid size-11 place-items-center rounded-md border-2 border-border bg-card p-0 text-foreground hover:border-primary hover:bg-card";

/**
 * Two columns on a desktop, one on a phone. Left: the wordmark, one short headline and the landing's
 * sample question. Right: the form. On a phone only the wordmark, Dot and the form remain.
 */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex-1 bg-background text-foreground lg:grid lg:grid-cols-[1.1fr_1fr]">
      <aside className="hidden flex-col gap-12 px-12 py-10 lg:flex xl:px-16">
        <Link href="/" aria-label="Edorax home" className="w-fit text-foreground">
          <Wordmark tone="auto" height={30} />
        </Link>
        <div className="max-w-[540px]">
          <h2 className="text-balance text-[40px] leading-[1.1] tracking-[-0.035em]">Pick up where you left off.</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Short chapters. No timer. Your place is always saved.
          </p>
        </div>
        {/* The landing card is always light, so its text stays ink in the dark theme too. */}
        <div style={{ color: "#0A0F2C" }}>
          <HeroQuestion />
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-col px-6 pb-12 pt-6 lg:justify-center lg:border-l lg:border-border lg:bg-card lg:px-12 lg:py-10">
        <div className="flex w-full items-center justify-between lg:absolute lg:right-12 lg:top-10 lg:w-auto">
          <Link href="/" aria-label="Edorax home" className="text-foreground lg:hidden">
            <Wordmark tone="auto" height={28} />
          </Link>
          <ThemeToggle className={THEME_BUTTON} />
        </div>
        <div className="mx-auto mt-8 flex w-full max-w-[420px] flex-col gap-6 lg:mt-0">{children}</div>
      </main>
    </div>
  );
}

/** Dot with one short line, then the heading and the form(s). */
export function AuthCard({
  title,
  description,
  mood,
  line,
  children,
}: {
  title: string;
  description: string;
  mood: DotMood;
  line: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="flex items-end gap-1">
        <Dot mood={mood} size={96} />
        <p className="mb-6 max-w-[260px] border border-border bg-card px-3.5 py-2.5 text-[15px] leading-snug text-card-foreground">
          {line}
        </p>
      </div>
      <h1 className="mt-4 text-[28px] leading-[1.15] tracking-[-0.035em]">{title}</h1>
      <p className="mb-6 mt-2 text-base text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
