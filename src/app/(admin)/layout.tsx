import { requireRole } from "@/server/auth/guards";
import { NavBar } from "@/components/nav-bar";
import { prisma } from "@/server/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const pendingRequests = await prisma.organizationCourseRequest.count({
    where: { status: "PENDING" },
  });

  const LINKS = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/organizations", label: "Organizations" },
    {
      href: "/admin/requests",
      label: "Requests",
      badge: pendingRequests,
    },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/users", label: "Users" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <NavBar links={LINKS} user={user} />
      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
