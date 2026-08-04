import { requireRole } from "@/server/auth/guards";
import { NavBar } from "@/components/nav-bar";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/progress", label: "My progress" },
];

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("MENTEE");

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.08),transparent)]"
        aria-hidden
      />
      <NavBar roleLabel="Mentee" links={LINKS} user={user} />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
