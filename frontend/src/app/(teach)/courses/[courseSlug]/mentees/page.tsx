import { Users } from "lucide-react";
import type { CourseMenteesView } from "@/shared/api/teach";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { MenteesHeader } from "@/components/teach/mentees/mentees-header";
import { CohortSummary } from "@/components/teach/mentees/cohort-summary";
import { InvitePanel, type AssignmentQuery } from "@/components/teach/mentees/invite-panel";
import { MenteesNeedingAttention } from "@/components/teach/mentees/needs-attention";
import { MenteeRoster } from "@/components/teach/mentees/mentee-roster";

export default async function CourseMenteesPage({ params, searchParams }: { params: Promise<{ courseSlug: string }>; searchParams: Promise<AssignmentQuery> }) {
  const { courseSlug } = await params;
  const query = await searchParams;
  await requireTeachSurface();
  const view = await serverApiFetchOrNotFound<CourseMenteesView>(`/api/v1/teach/courses/${encodeURIComponent(courseSlug)}/mentees`);

  return <div className="mx-auto max-w-7xl space-y-7">
    <MenteesHeader view={view} />
    <CohortSummary summary={view.summary} />
    <InvitePanel view={view} query={query} />
    {view.mentees.length ? <><MenteesNeedingAttention mentees={view.attentionMentees} /><MenteeRoster mentees={view.mentees} /></> : <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-16 text-center"><span className="grid size-12 place-items-center rounded-2xl border bg-background"><Users className="size-5 text-muted-foreground" /></span><h2 className="mt-4 text-base font-semibold">No learners enrolled</h2><p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{view.course.status === "PUBLISHED" ? "Use the invitation panel above to assign accounts or share an enrollment link." : "Publish this course before inviting learners."}</p></div>}
  </div>;
}
