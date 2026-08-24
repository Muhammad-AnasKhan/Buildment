import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { GlassNavShell } from "@/components/glass-nav-shell";
import { NavUserMenu } from "@/components/nav-user-menu";

export function NavBar({
  links,
  user,
}: {
  links: { href: string; label: string }[];
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
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
            >
              {link.label}
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
