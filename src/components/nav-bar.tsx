import Link from "next/link";
import { signOut } from "@/server/auth/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function NavBar({
  roleLabel,
  links,
  user,
}: {
  roleLabel: string;
  links: { href: string; label: string }[];
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const initials = (user.name ?? user.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-base font-semibold tracking-tight">
          buildment
        </Link>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {roleLabel}
        </span>
        <nav className="flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email ?? "avatar"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
