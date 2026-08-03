import { requireRole } from "@/server/auth/guards";
import { NavBar } from "@/components/nav-bar";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/progress", label: "My progress" },
];

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("MENTEE");

  return (
    <div className="flex flex-1 flex-col">
      <NavBar roleLabel="Mentee" links={LINKS} user={user} />
      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
