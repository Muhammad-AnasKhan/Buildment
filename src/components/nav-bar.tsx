import Link from "next/link";
import { signOut } from "@/server/auth/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/brand/logo";
import { GlassNavShell } from "@/components/glass-nav-shell";

export function NavBar({
  links,
  user,
}: {
  links: { href: string; label: string }[];
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const initials = (user.name ?? user.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <GlassNavShell>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Link href="/" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <span className="h-4 w-px shrink-0 bg-neutral-200" aria-hidden />
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Avatar className="h-8 w-8 ring-2 ring-white">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email ?? "avatar"} />
          <AvatarFallback className="bg-indigo-50 text-xs font-semibold text-indigo-700">
            {initials}
          </AvatarFallback>
        </Avatar>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="ghost" size="sm" className="rounded-full text-neutral-500">
            Sign out
          </Button>
        </form>
      </div>
    </GlassNavShell>
  );
}
