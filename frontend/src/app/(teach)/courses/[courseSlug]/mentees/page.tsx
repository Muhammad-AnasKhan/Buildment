import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { loadCourseMentees } from "@/server/mentor-dashboard/load-mentees";
import { MenteesHeader } from "@/components/teach/mentees/mentees-header";
import { CohortSummary } from "@/components/teach/mentees/cohort-summary";
import { InvitePanel, type AssignmentQuery } from "@/components/teach/mentees/invite-panel";
import { MenteesNeedingAttention } from "@/components/teach/mentees/needs-attention";
import { MenteeRoster } from "@/components/teach/mentees/mentee-roster";

export default async function CourseMenteesPage({ params, searchParams }: { params: Promise<{ courseSlug: string }>; searchParams: Promise<AssignmentQuery> }) {
  const { courseSlug } = await params;
  const query = await searchParams;
  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true } });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const view = await loadCourseMentees({ courseId: course.id, courseSlug });
  if (!view) notFound();

  return <div className="mx-auto max-w-7xl space-y-7">
    <MenteesHeader view={view} />
    <CohortSummary summary={view.summary} />
    <InvitePanel view={view} query={query} />
    {view.mentees.length ? <><MenteesNeedingAttention mentees={view.attentionMentees} /><MenteeRoster mentees={view.mentees} /></> : <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-16 text-center"><span className="grid size-12 place-items-center rounded-2xl border bg-background"><Users className="size-5 text-muted-foreground" /></span><h2 className="mt-4 text-base font-semibold">No learners enrolled</h2><p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{view.course.status === "PUBLISHED" ? "Use the invitation panel above to assign accounts or share an enrollment link." : "Publish this course before inviting learners."}</p></div>}
  </div>;
}
