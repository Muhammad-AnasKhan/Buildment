"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHeader({ showCourses }: { showCourses: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          <a href="#why" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Why buildment
          </a>
          <a href="#work" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
          {showCourses ? (
            <a href="#courses" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Courses
            </a>
          ) : null}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }), "ml-1 h-9 px-4")}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
