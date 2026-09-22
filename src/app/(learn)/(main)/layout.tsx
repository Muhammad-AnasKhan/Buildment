import { requireRole } from "@/server/auth/guards";
import { NavBar } from "@/components/nav-bar";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/progress", label: "My progress" },
  { href: "/my-questions", label: "My help notes" },
];

export default async function LearnMainLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("MENTEE");

  return (
    <>
      <NavBar links={LINKS} user={user} />
      <main className="flex-1">{children}</main>
    </>
  );
}
