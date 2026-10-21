import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { CourseSettingsView, CourseTeamView } from "@/shared/api/teach";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { CourseSettings } from "@/components/teach/course-cms/course-settings";
import { CourseTeamPanel } from "@/components/teach/course-cms/course-team-panel";
import { CourseManagementMenu } from "@/components/teach/course-cms/course-management-menu";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CourseSettingsPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  await requireTeachSurface();
  const [course, team] = await Promise.all([
    serverApiFetchOrNotFound<CourseSettingsView>(`/api/v1/teach/courses/${encodeURIComponent(courseSlug)}/settings`),
    serverApiFetchOrNotFound<CourseTeamView>(`/api/v1/teach/courses/${encodeURIComponent(courseSlug)}/team`),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-7 pb-16">
      <header className="space-y-5 border-b pb-6">
        <Link href={`/courses/${course.slug}/edit`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" aria-hidden />Back to curriculum</Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{course.title}</p><Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"}>{course.status === "PUBLISHED" ? "Published" : course.status === "ARCHIVED" ? "Archived" : "Draft"}</Badge></div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Course settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Manage how this course appears to learners, how they move through it, and who can help teach it.</p>
          </div>
          <Link href={`/courses/${course.slug}/preview`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 self-start sm:self-auto")}>Preview course<ExternalLink className="size-4" aria-hidden /></Link>
        </div>
      </header>

      <nav aria-label="Settings sections" className="flex flex-wrap gap-2 text-sm">
        <a href="#course-details" className="rounded-full border bg-card px-3 py-1.5 font-medium hover:bg-muted">Course details</a>
        <a href="#learning-rules" className="rounded-full border bg-card px-3 py-1.5 font-medium hover:bg-muted">Learning experience</a>
        <a href="#pricing" className="rounded-full border bg-card px-3 py-1.5 font-medium hover:bg-muted">Pricing</a>
        <a href="#course-team" className="rounded-full border bg-card px-3 py-1.5 font-medium hover:bg-muted">Course team</a>
        <a href="#course-management" className="rounded-full border bg-card px-3 py-1.5 font-medium hover:bg-muted">Management</a>
      </nav>

      <CourseSettings key={course.id} course={course} />
      <div id="course-team" className="scroll-mt-24"><CourseTeamPanel courseId={course.id} courseSlug={course.slug} team={team} /></div>
      <section id="course-management" aria-labelledby="course-management-title" className="scroll-mt-24 rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="course-management-title" className="text-base font-semibold">Course management</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Archive, restore, or delete this course.</p>
          </div>
          <CourseManagementMenu course={{ id: course.id, title: course.title, status: course.status, enrollmentCount: course.enrollmentCount }} chapterCount={course.chapterCount} />
        </div>
      </section>
    </main>
  );
}
