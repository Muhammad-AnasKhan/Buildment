import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReviewDetailView } from "@/shared/api/teach";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { submitReview } from "@/server/actions/reviews";
import { ReviewForm } from "@/components/teach/review-form";
import { QuizIntegrity } from "@/components/teach/evaluation/quiz-integrity";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ responseId: string }>;
}) {
  const { responseId } = await params;
  await requireTeachSurface();

  const response = await serverApiFetchOrNotFound<ReviewDetailView>(
    `/api/v1/teach/review/${encodeURIComponent(responseId)}`
  );
  const { course, question, history } = response;
  const alreadyReviewed = response.status !== "PENDING_REVIEW";
  const reviewResponseId = response.id;

  async function submitReviewAction(formData: FormData) {
    "use server";
    const verdict = formData.get("verdict") === "APPROVED" ? "APPROVED" : "NEEDS_REVISION";
    const feedback = String(formData.get("feedback") ?? "");
    const rawScore = String(formData.get("score") ?? "");
    const result = await submitReview({
      responseId: reviewResponseId,
      verdict,
      feedback,
      score: rawScore === "" ? undefined : Number(rawScore),
    });
    if (result.ok) redirect("/review");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/review"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to queue
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {course.title} › {response.chapterTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {response.learner.name ?? response.learner.email} · attempt {response.attempt} ·{" "}
            submitted {new Date(response.submittedAt).toLocaleString()}
          </p>
        </div>
        {response.status === "PENDING_REVIEW" && (
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            Pending review
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Left: the question, rubric, and reference answer — mentor-only config */}
        <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <h2 className="text-sm font-semibold">Question</h2>
          <p className="mt-2 text-[15px] font-medium leading-snug">
            {question?.prompt ?? "(prompt unavailable)"}
          </p>

          {question && question.minWords > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Minimum {question.minWords} words
              {question.maxWords ? ` · maximum ${question.maxWords}` : ""}
            </p>
          )}

          {question?.rubric && (
            <div className="mt-4 rounded-lg border bg-muted/40 p-4">
              <h3 className="text-xs font-medium text-muted-foreground">Rubric (mentor only)</h3>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{question.rubric}</p>
            </div>
          )}

          {question?.sampleAnswer && (
            <div className="mt-3 rounded-lg border bg-muted/40 p-4">
              <h3 className="text-xs font-medium text-muted-foreground">
                Reference answer (mentor only)
              </h3>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{question.sampleAnswer}</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold">Previous exchange</h3>
              {history.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Attempt {item.attempt} ·{" "}
                    {item.verdict === "APPROVED" ? "approved" : "sent back for revision"} by{" "}
                    {item.reviewerName ?? "mentor"}
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm">{item.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right: the mentee's answer + review form */}
        <section className="flex flex-col gap-4">
          <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <h2 className="text-sm font-semibold">Mentee&apos;s answer</h2>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">
              {response.answerText}
            </p>
            {response.answerUrl ? (
              <p className="mt-3 text-sm">
                <span className="font-medium">Submitted link: </span>
                <a href={response.answerUrl} className="break-all text-primary underline underline-offset-2" target="_blank" rel="noreferrer noopener">
                  {response.answerUrl}
                </a>
              </p>
            ) : null}
          </div>

          {alreadyReviewed ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
              Already reviewed —{" "}
              {response.status === "REVIEWED" ? "approved" : "sent back for revision"}
              {response.review?.score !== null && response.review?.score !== undefined
                ? ` with score ${response.review.score}/${response.block.points}`
                : ""}
              .
            </div>
          ) : (
            <ReviewForm
              responseId={reviewResponseId}
              maxScore={response.block.points}
              action={submitReviewAction}
            />
          )}
        </section>
      </div>

      {response.integrity.length > 0 ? (
        <div className="mt-6">
          <QuizIntegrity attempts={response.integrity} showChapter={false} />
        </div>
      ) : null}
    </div>
  );
}
