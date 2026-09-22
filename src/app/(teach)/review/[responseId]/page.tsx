import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { submitReview } from "@/server/actions/reviews";
import { OpenQuestionConfigSchema } from "@/blocks/open-question/schema";

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
  const answerUrl = typeof payload?.url === "string" ? payload.url : null;

  const alreadyReviewed = response.status !== "PENDING_REVIEW";
  const course = response.block.chapter.course;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/review"
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← Back to queue
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {course.title} › {response.block.chapter.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {response.user.name ?? response.user.email} · attempt {response.attempt} ·{" "}
            submitted {response.submittedAt.toLocaleString()}
          </p>
        </div>
        {response.status === "PENDING_REVIEW" && (
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            Pending review
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Left: the question, rubric, and reference answer — mentor-only config */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Question</h2>
          <p className="mt-2 text-[15px] font-medium leading-snug text-neutral-900">
            {prompt ?? "(prompt unavailable)"}
          </p>

          {config.success && config.data.minWords > 0 && (
            <p className="mt-2 text-xs text-neutral-400">
              Minimum {config.data.minWords} words
              {config.data.maxWords ? ` · maximum ${config.data.maxWords}` : ""}
            </p>
          )}

          {config.success && config.data.rubric && (
            <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
              <h3 className="text-xs font-medium text-indigo-600">Rubric (mentor only)</h3>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {config.data.rubric}
              </p>
            </div>
          )}

          {config.success && config.data.sampleAnswer && (
            <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="text-xs font-medium text-neutral-500">
                Reference answer (mentor only)
              </h3>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {config.data.sampleAnswer}
              </p>
            </div>
          )}

          {history.filter((item) => item.review).length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900">Previous exchange</h3>
              {history
                .filter((item) => item.review)
                .map((item) => (
                  <div key={item.id} className="rounded-lg border border-neutral-200 p-3">
                    <p className="text-xs font-medium text-neutral-500">
                      Attempt {item.attempt} ·{" "}
                      {item.review!.verdict === "APPROVED" ? "approved" : "sent back for revision"}{" "}
                      by {item.review!.reviewer.name ?? "mentor"}
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-neutral-700">
                      {item.review!.feedback}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Right: the mentee's answer + review form */}
        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-900">Mentee&apos;s answer</h2>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-800">
              {answerText}
            </p>
            {answerUrl ? (
              <p className="mt-3 text-sm">
                <span className="font-medium text-neutral-700">Submitted link: </span>
                <a href={answerUrl} className="break-all text-indigo-700 underline" target="_blank" rel="noreferrer">
                  {answerUrl}
                </a>
              </p>
            ) : null}
          </div>

          {alreadyReviewed ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Already reviewed —{" "}
              {response.status === "REVIEWED" ? "approved" : "sent back for revision"}
              {response.review?.score !== null && response.review?.score !== undefined
                ? ` with score ${response.review.score}/${response.block.points}`
                : ""}
              .
            </div>
          ) : (
            <form
              className="rounded-xl border border-neutral-200 bg-white p-5"
              action={async (formData) => {
                "use server";
                const verdict =
                  formData.get("verdict") === "APPROVED" ? "APPROVED" : "NEEDS_REVISION";
                const feedback = String(formData.get("feedback") ?? "");
                const rawScore = String(formData.get("score") ?? "");
                const result = await submitReview({
                  responseId: response.id,
                  verdict,
                  feedback,
                  score: rawScore === "" ? undefined : Number(rawScore),
                });
                if (result.ok) redirect("/review");
              }}
            >
              <h2 className="text-sm font-semibold text-neutral-900">Your review</h2>

              <div className="mt-3 flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-neutral-700">Feedback</span>
                  <textarea
                    name="feedback"
                    required
                    rows={4}
                    placeholder="What worked, what to fix, what to read next…"
                    className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-800 outline-none transition-colors focus:border-indigo-300"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  Score (0–{response.block.points}, optional)
                  <input
                    type="number"
                    name="score"
                    min={0}
                    max={response.block.points}
                    className="h-9 w-24 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-indigo-300"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  name="verdict"
                  value="APPROVED"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </button>
                <button
                  type="submit"
                  name="verdict"
                  value="NEEDS_REVISION"
                  className="h-10 rounded-lg border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Needs revision
                </button>
                <p className="text-xs text-neutral-400">
                  The mentee sees your feedback when they reopen the chapter.
                </p>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
