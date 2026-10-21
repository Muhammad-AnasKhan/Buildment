import type { MenteeEvaluation } from "@/shared/api/teach";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { EvaluationHeader } from "@/components/teach/evaluation/evaluation-header";
import { EvaluationWorkspace } from "@/components/teach/evaluation/evaluation-workspace";

export default async function MenteeEvaluationPage({ params }: { params: Promise<{ courseSlug: string; enrollmentId: string }> }) {
  const { courseSlug, enrollmentId } = await params;
  await requireTeachSurface();
  const evaluation = await serverApiFetchOrNotFound<MenteeEvaluation>(
    `/api/v1/teach/courses/${encodeURIComponent(courseSlug)}/mentees/${encodeURIComponent(enrollmentId)}`
  );

  return <div className="min-h-screen">
    <EvaluationHeader evaluation={evaluation} />
    <main className="mx-auto max-w-7xl space-y-5 py-5 sm:py-6">
      <EvaluationWorkspace evaluation={evaluation} />
    </main>
  </div>;
}
