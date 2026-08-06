import { requireRole } from "@/server/auth/guards";
import { NavBar } from "@/components/nav-bar";

const LINKS = [{ href: "/admin", label: "Admin" }];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");

  return (
    <div className="flex flex-1 flex-col">
      <NavBar links={LINKS} user={user} />
      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
