import type { TeachWorkspace } from "@/shared/api/teach";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { MentorWorkspaceSidebar } from "@/components/teach/mentor-workspace-sidebar";
import { signOutAction } from "@/server/auth/actions";

export default async function TeachLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTeachSurface();
  const { courses, instructorAccess } = await serverApiFetch<TeachWorkspace>("/api/v1/teach/workspace");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <MentorWorkspaceSidebar
        courses={courses}
        user={user}
        instructorAccess={instructorAccess}
        signOutAction={signOutAction}
      />
      <main className="min-h-dvh lg:pl-60">
        <div className="mx-auto w-full max-w-[96rem] px-6 py-8 sm:px-10">{children}</div>
      </main>
    </div>
  );
}
