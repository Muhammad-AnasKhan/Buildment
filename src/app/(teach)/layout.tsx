import { requireRole } from "@/server/auth/guards";
import { NavBar } from "@/components/nav-bar";
import { countOpenHelpRequests } from "@/server/help/count-open";

export default async function TeachLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("MENTOR", "ADMIN");
  const openHelpCount = await countOpenHelpRequests(user);

  const links = [
    { href: "/courses", label: "Courses" },
    { href: "/help", label: "Mentee requests", badge: openHelpCount },
    { href: "/review", label: "Review queue" },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <NavBar links={links} user={user} />
      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
