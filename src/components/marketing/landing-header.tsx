"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHeader({ showCourses }: { showCourses: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 sm:flex">
          <a href="#work" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          {showCourses ? (
            <a href="#courses" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Courses
            </a>
          ) : null}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }), "ml-1 h-8 px-3")}>
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
