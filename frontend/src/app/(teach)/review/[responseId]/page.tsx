import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { submitReview } from "@/server/actions/reviews";
import { OpenQuestionConfigSchema } from "@/blocks/open-question/schema";
import { parseSafeSubmissionUrl } from "@/lib/safe-submission-url";
import { ReviewForm } from "@/components/teach/review-form";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ responseId: string }>;
}) {
  const { responseId } = await params;

  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      block: {
        include: {
          chapter: {
            select: { title: true, course: { select: { id: true, slug: true, title: true } } },
          },
        },
      },
      review: true,
    },
  });
  if (!response) notFound();

  await requireMentorOfCourse(response.block.chapter.course.id);

  // Threaded exchange history: every attempt by this mentee on this block,
  // oldest first, so prior feedback sits next to the resubmission (docs/05).
  const history = await prisma.response.findMany({
    where: { blockId: response.blockId, userId: response.userId },
    orderBy: { attempt: "asc" },
    include: { review: { include: { reviewer: { select: { name: true } } } } },
  });

  const config = OpenQuestionConfigSchema.safeParse(response.block.config);
  const prompt = config.success ? config.data.prompt : null;
  const payload = response.payload as { text?: string; url?: string } | null;
  const answerText =
    typeof payload?.text === "string" && payload.text.trim()
      ? payload.text
      : payload?.url
        ? `(Link submission)\n${payload.url}`
        : JSON.stringify(response.payload, null, 2);
  const rawAnswerUrl = typeof payload?.url === "string" ? payload.url : null;
  const answerUrl = rawAnswerUrl ? parseSafeSubmissionUrl(rawAnswerUrl)?.toString() ?? null : null;

  const alreadyReviewed = response.status !== "PENDING_REVIEW";
  const course = response.block.chapter.course;
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
            {course.title} › {response.block.chapter.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {response.user.name ?? response.user.email} · attempt {response.attempt} ·{" "}
            submitted {response.submittedAt.toLocaleString()}
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
            {prompt ?? "(prompt unavailable)"}
          </p>

          {config.success && config.data.minWords > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Minimum {config.data.minWords} words
              {config.data.maxWords ? ` · maximum ${config.data.maxWords}` : ""}
            </p>
          )}

          {config.success && config.data.rubric && (
            <div className="mt-4 rounded-lg border bg-muted/40 p-4">
              <h3 className="text-xs font-medium text-muted-foreground">Rubric (mentor only)</h3>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                {config.data.rubric}
              </p>
            </div>
          )}

          {config.success && config.data.sampleAnswer && (
            <div className="mt-3 rounded-lg border bg-muted/40 p-4">
              <h3 className="text-xs font-medium text-muted-foreground">
                Reference answer (mentor only)
              </h3>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                {config.data.sampleAnswer}
              </p>
            </div>
          )}

          {history.filter((item) => item.review).length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold">Previous exchange</h3>
              {history
                .filter((item) => item.review)
                .map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Attempt {item.attempt} ·{" "}
                      {item.review!.verdict === "APPROVED" ? "approved" : "sent back for revision"}{" "}
                      by {item.review!.reviewer.name ?? "mentor"}
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm">
                      {item.review!.feedback}
                    </p>
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
              {answerText}
            </p>
            {answerUrl ? (
              <p className="mt-3 text-sm">
                <span className="font-medium">Submitted link: </span>
                <a href={answerUrl} className="break-all text-primary underline underline-offset-2" target="_blank" rel="noreferrer noopener">
                  {answerUrl}
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
    </div>
  );
}
