import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { GlassNavShell } from "@/components/glass-nav-shell";
import { NavUserMenu } from "@/components/nav-user-menu";

export function NavBar({
  links,
  user,
}: {
  links: { href: string; label: string; badge?: number }[];
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  return (
    <GlassNavShell>
      <div className="flex min-w-0 items-center gap-6">
        <Link href="/" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
              {link.badge != null && link.badge > 0 && (
                <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                  {link.badge > 99 ? "99+" : link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <NavUserMenu
        user={user}
        homeHref={links[0]?.href ?? "/"}
        showProgress={links.some((link) => link.href === "/progress")}
      />
    </GlassNavShell>
  );
}
