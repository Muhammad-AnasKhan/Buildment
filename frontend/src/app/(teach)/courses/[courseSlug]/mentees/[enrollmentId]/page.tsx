import type { MenteeEvaluation } from "@/shared/api/teach";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { EvaluationHeader } from "@/components/teach/evaluation/evaluation-header";
import { EvaluationSummary } from "@/components/teach/evaluation/evaluation-summary";
import { NeedsAttention } from "@/components/teach/evaluation/needs-attention";
import { ProjectEvidence } from "@/components/teach/evaluation/project-evidence";
import { CourseProgressMap } from "@/components/teach/evaluation/course-progress-map";
import { SubmissionFilters } from "@/components/teach/evaluation/submission-filters";
import { FeedbackTimeline } from "@/components/teach/evaluation/feedback-timeline";
import { ActivitySummary } from "@/components/teach/evaluation/activity-summary";
import { LearnerReflections } from "@/components/teach/evaluation/learner-reflections";
import { QuizIntegrity } from "@/components/teach/evaluation/quiz-integrity";

export default async function MenteeEvaluationPage({ params }: { params: Promise<{ courseSlug: string; enrollmentId: string }> }) {
  const { courseSlug, enrollmentId } = await params;
  await requireTeachSurface();
  const evaluation = await serverApiFetchOrNotFound<MenteeEvaluation>(
    `/api/v1/teach/courses/${encodeURIComponent(courseSlug)}/mentees/${encodeURIComponent(enrollmentId)}`
  );

  return <div className="min-h-screen">
    <EvaluationHeader evaluation={evaluation} />
    <main className="mx-auto max-w-7xl space-y-6 py-6 sm:py-8">
      <EvaluationSummary evaluation={evaluation} />
      <NeedsAttention items={evaluation.attention} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ProjectEvidence items={evaluation.evidence} />
        <ActivitySummary help={evaluation.help} sessions={evaluation.sessions} />
      </div>
      <CourseProgressMap modules={evaluation.modules} integrity={evaluation.integrity} />
      <QuizIntegrity attempts={evaluation.integrity} />
      <LearnerReflections items={evaluation.reflections} />
      <SubmissionFilters items={evaluation.submissions} />
      <FeedbackTimeline items={evaluation.timeline} />
    </main>
  </div>;
}
