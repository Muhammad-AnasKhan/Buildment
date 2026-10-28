import Link from "next/link";
import type { ReactNode } from "react";
import { Dot, type DotMood } from "@/components/brand/dot";
import { Wordmark } from "@/components/brand/wordmark";

/** A single centred message (check your email, verify your email): wordmark, Dot with one line, heading, text, actions. */
export function AuthMessage({
  mood,
  line,
  title,
  text,
  children,
}: {
  mood: DotMood;
  line: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-background px-6 pb-16 pt-6 text-foreground">
      <header className="mx-auto w-full max-w-[1200px]">
        <Link href="/" aria-label="Edorax home" className="inline-block text-foreground">
          <Wordmark tone="auto" height={28} />
        </Link>
      </header>
      <main className="mx-auto mt-12 flex w-full max-w-[420px] flex-col">
        <div className="flex items-end gap-1">
          <Dot mood={mood} size={96} />
          <p className="mb-6 max-w-[260px] border border-border bg-card px-3.5 py-2.5 text-[15px] leading-snug text-card-foreground">
            {line}
          </p>
        </div>
        <h1 className="mt-4 text-[28px] leading-[1.15] tracking-[-0.035em]">{title}</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">{text}</p>
        {children ? <div className="mt-6">{children}</div> : null}
      </main>
    </div>
  );
}
