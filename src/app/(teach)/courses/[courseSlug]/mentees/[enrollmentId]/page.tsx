import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { loadMenteeEvaluation } from "@/server/evaluation/load-mentee-evaluation";
import { EvaluationHeader } from "@/components/teach/evaluation/evaluation-header";
import { EvaluationSummary } from "@/components/teach/evaluation/evaluation-summary";
import { NeedsAttention } from "@/components/teach/evaluation/needs-attention";
import { ProjectEvidence } from "@/components/teach/evaluation/project-evidence";
import { CourseProgressMap } from "@/components/teach/evaluation/course-progress-map";
import { SubmissionFilters } from "@/components/teach/evaluation/submission-filters";
import { FeedbackTimeline } from "@/components/teach/evaluation/feedback-timeline";
import { ActivitySummary } from "@/components/teach/evaluation/activity-summary";

export default async function MenteeEvaluationPage({ params }: { params: Promise<{ courseSlug: string; enrollmentId: string }> }) {
  const { courseSlug, enrollmentId } = await params;
  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true, slug: true, title: true } });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const evaluation = await loadMenteeEvaluation({ course, enrollmentId });
  if (!evaluation) notFound();

  return <div className="min-h-screen">
    <EvaluationHeader evaluation={evaluation} />
    <main className="mx-auto max-w-7xl space-y-6 py-6 sm:py-8">
      <EvaluationSummary evaluation={evaluation} />
      <NeedsAttention items={evaluation.attention} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ProjectEvidence items={evaluation.evidence} />
        <ActivitySummary help={evaluation.help} sessions={evaluation.sessions} />
      </div>
      <CourseProgressMap modules={evaluation.modules} />
      <SubmissionFilters items={evaluation.submissions} />
      <FeedbackTimeline items={evaluation.timeline} />
    </main>
  </div>;
}
