import type { ReactNode } from "react";
import { LoginBrandPanel } from "@/components/marketing/login-brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Two-column layout shared by /login and /signup: brand + chapter gate on the left,
 * the form card on the right. Stacks (brand on top) below 900px.
 */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-full flex-1 bg-background text-foreground min-[901px]:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />

      <main className="relative flex min-w-0 flex-col items-center justify-center gap-5 px-6 pb-10 pt-[72px] min-[901px]:py-10">
        <ThemeToggle className="absolute right-7 top-[calc(24px+env(safe-area-inset-top,0px))] grid size-10 place-items-center rounded-xl border border-border bg-card p-0 text-foreground" />
        {children}
      </main>
    </div>
  );
}

/** The rounded white card that holds the heading and the form(s). */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-[440px] rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-[0_20px_50px_-24px_rgba(0,0,0,0.22)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]">
      <h2 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.02em]">{title}</h2>
      <p className="mb-[22px] mt-1.5 text-[15px] text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
