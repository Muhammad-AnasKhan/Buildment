import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingHeader({ showCourses }: { showCourses: boolean }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="buildment home" className="py-2"><Logo size="md" /></Link>
        <div className="flex items-center gap-4 sm:order-3">
          <ThemeToggle className="size-11 rounded-none p-3" />
          <Link href="/login" className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">Sign in</Link>
        </div>
        <nav aria-label="Primary navigation" className="flex w-full items-center justify-between gap-3 text-xs sm:w-auto sm:gap-6 sm:text-sm">
          {showCourses ? <a href="#courses" className="inline-flex min-h-11 items-center hover:underline underline-offset-4">The courses</a> : null}
          <a href="#why" className="inline-flex min-h-11 items-center hover:underline underline-offset-4">With a mentor</a>
          <a href="#work" className="inline-flex min-h-11 items-center hover:underline underline-offset-4">Your first chapter</a>
        </nav>
      </div>
    </header>
  );
}
