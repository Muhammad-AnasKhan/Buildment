import { requireRole } from "@/server/auth/guards";
import { MentorWorkspaceSidebar } from "@/components/teach/mentor-workspace-sidebar";
import { signOutAction } from "@/server/auth/actions";
import { prisma } from "@/server/db";

export default async function TeachLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("MENTOR", "ADMIN");
  const rows = await prisma.course.findMany({
    where: user.role === "ADMIN" ? undefined : { mentorId: user.id },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      _count: { select: { chapters: true, enrollments: true } },
      enrollments: { select: { pendingReviews: true } },
      helpThreads: { where: { status: "OPEN" }, select: { id: true } },
    },
  });
  const courses = rows.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    status: course.status,
    chapterCount: course._count.chapters,
    learnerCount: course._count.enrollments,
    pendingReviews: course.enrollments.reduce((sum, item) => sum + item.pendingReviews, 0),
    openHelpRequests: course.helpThreads.length,
  }));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <MentorWorkspaceSidebar courses={courses} user={user} signOutAction={signOutAction} />
      <main className="min-h-dvh lg:pl-72">
        <div className="mx-auto w-full max-w-[96rem] px-6 py-8 sm:px-10">{children}</div>
      </main>
    </div>
  );
}
