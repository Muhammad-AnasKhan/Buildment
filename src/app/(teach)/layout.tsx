import { requireRole } from "@/server/auth/guards";
import { NavBar } from "@/components/nav-bar";

const LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/review", label: "Review queue" },
];

export default async function TeachLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("MENTOR", "ADMIN");

  return (
    <div className="flex flex-1 flex-col">
      <NavBar roleLabel="Mentor" links={LINKS} user={user} />
      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
