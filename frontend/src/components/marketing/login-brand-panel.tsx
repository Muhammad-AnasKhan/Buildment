"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Lock, LockOpen } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const CHECKS = [
  "Interactive chapters with quizzes, gates, and open questions",
  "Project-based courses: learn by shipping a real codebase",
  "Mentor dashboards for reviews, progress, and cohort activity",
];

const OPTIONS = [
  { label: "Secure", correct: false },
  { label: "HttpOnly", correct: true },
  { label: "SameSite", correct: false },
];

/** Left half of /login and /signup: pitch + a tiny interactive chapter gate. */
export function LoginBrandPanel() {
  const [unlocked, setUnlocked] = useState(false);
  const [wrong, setWrong] = useState<{ label: string; n: number } | null>(null);

  function pick(option: (typeof OPTIONS)[number]) {
    if (unlocked) return;
    if (option.correct) {
      setWrong(null);
      setUnlocked(true);
    } else {
      // new `n` on every wrong click so the shake replays
      setWrong({ label: option.label, n: (wrong?.n ?? 0) + 1 });
    }
  }

  return (
    <aside className="relative flex flex-col gap-7 overflow-hidden border-border bg-[linear-gradient(160deg,var(--muted),var(--background)_60%)] px-6 py-7 min-[901px]:border-r min-[901px]:px-14 min-[901px]:py-10">
      {/* keyframes live here so global.css stays untouched */}
      <style>{`@keyframes login-float{to{transform:translate(-40px,60px)}}@media (prefers-reduced-motion:no-preference){.login-float{animation:login-float 12s ease-in-out infinite alternate}}`}</style>

      {/* floating soft blob */}
      <div
        aria-hidden
        className="login-float pointer-events-none absolute -right-[140px] -top-[120px] size-[420px] rounded-full bg-[radial-gradient(circle,var(--foreground)_0%,transparent_70%)] opacity-[0.07]"
      />

      <Link href="/" className="relative w-fit">
        <Logo size="md" />
      </Link>

      <h1 className="relative text-[clamp(30px,3.4vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em] min-[901px]:max-w-[17ch]">
        Mentors write the course. Learners prove they understood.
      </h1>

      <ul className="relative flex flex-col gap-2.5 text-muted-foreground">
        {CHECKS.map((text) => (
          <li key={text} className="flex items-center gap-3">
            <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
              <Check className="size-3" strokeWidth={3} aria-hidden />
            </span>
            {text}
          </li>
        ))}
      </ul>

      <div
        aria-label="Sample chapter gate"
        className="relative rounded-[20px] border border-border bg-card p-[22px] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.22)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] min-[901px]:max-w-[520px]"
      >
        <small className="font-semibold text-muted-foreground">
          Chapter 3 · Sessions and cookies
        </small>
        <h3 className="mb-2 mt-1 text-xl font-bold leading-[1.1] tracking-[-0.02em]">
          Which cookie flag hides it from JavaScript?
        </h3>
        <p className="mb-3.5 text-[15px] text-muted-foreground">
          Answer correctly to unlock the next chapter. Try it.
        </p>

        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((option) => {
            const isGood = unlocked && option.correct;
            const isBad = wrong?.label === option.label;
            return (
              <button
                key={isBad ? `${option.label}-${wrong?.n}` : option.label}
                type="button"
                onClick={() => pick(option)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                  isGood
                    ? "border-ok bg-ok text-white dark:text-[oklch(0.18_0.02_160)]"
                    : isBad
                      ? "animate-feedback-shake border-destructive text-destructive"
                      : "border-border bg-background hover:border-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div
          aria-live="polite"
          className={cn(
            "mt-4 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-[400ms]",
            unlocked
              ? "bg-ok-soft font-semibold text-ok"
              : "bg-background text-muted-foreground",
          )}
        >
          {unlocked ? (
            <LockOpen className="size-4" aria-hidden />
          ) : (
            <Lock className="size-4" aria-hidden />
          )}
          <span>
            {unlocked
              ? "Correct. Chapter 4 is unlocked"
              : wrong
                ? "Not quite. Think about who can read the cookie."
                : "Chapter 4 is locked"}
          </span>
        </div>
      </div>

      <Link
        href="/"
        className="relative mt-auto hidden w-fit text-sm text-muted-foreground transition-colors hover:text-foreground min-[901px]:block"
      >
        ← Back to home
      </Link>
    </aside>
  );
}
