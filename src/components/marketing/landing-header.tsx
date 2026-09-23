import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinkClass =
  "rounded-md font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50";

export function LandingHeader({ showCourses }: { showCourses: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="relative flex h-14 items-center justify-between sm:h-16">
          <Link
            href="/"
            aria-label="buildment home"
            className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo size="sm" />
          </Link>
          <nav
            aria-label="Primary navigation"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          >
            <a
              href="#why"
              className={cn(navLinkClass, "px-3 py-2 text-sm hover:bg-muted/60")}
            >
              Why buildment
            </a>
            <a
              href="#work"
              className={cn(navLinkClass, "px-3 py-2 text-sm hover:bg-muted/60")}
            >
              How it works
            </a>
            {showCourses ? (
              <a
                href="#courses"
                className={cn(navLinkClass, "px-3 py-2 text-sm hover:bg-muted/60")}
              >
                Courses
              </a>
            ) : null}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle className="size-9 p-0" />
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-9 gap-1.5 px-3 sm:px-4",
              )}
            >
              Get started
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="-mx-1 flex h-10 items-center gap-1 overflow-x-auto md:hidden"
        >
          <a href="#why" className={cn(navLinkClass, "shrink-0 px-2 py-1.5 text-xs")}>
            Why buildment
          </a>
          <a href="#work" className={cn(navLinkClass, "shrink-0 px-2 py-1.5 text-xs")}>
            How it works
          </a>
          {showCourses ? (
            <a
              href="#courses"
              className={cn(navLinkClass, "shrink-0 px-2 py-1.5 text-xs")}
            >
              Courses
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
