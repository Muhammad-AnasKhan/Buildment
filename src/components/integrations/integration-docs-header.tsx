import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function IntegrationDocsHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="buildment home"
          >
            <Logo size="sm" />
          </Link>
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <Link
            href="/integrations"
            className="hidden truncate text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Integrations
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle className="size-9 p-0" />
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden gap-1.5 sm:inline-flex")}
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Home
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }), "h-9 px-3")}>
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
