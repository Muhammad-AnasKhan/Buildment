import Link from "next/link";
import { ArrowRight, BookOpenText, MessageCircleQuestion } from "lucide-react";
import type { HelpThreadSummary } from "@/shared/api/help";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { LearnerQuestionsOverview } from "@/components/help/learner-questions-overview";

export default async function MenteeHelpListPage({ searchParams }: { searchParams: Promise<{ course?: string; chapter?: string; question?: string }> }) {
  const user = await requireLearnSurface();
  const [{ threads }, filters] = await Promise.all([
    serverApiFetch<{ threads: HelpThreadSummary[] }>("/api/v1/help/threads"),
    searchParams,
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Learning support</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your questions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep track of questions from your lessons and continue the conversation with your mentor.
          </p>
        </div>
        <Link href="/my-courses" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted sm:self-auto">
          <BookOpenText className="size-4" aria-hidden /> Go to my courses
        </Link>
      </header>

      {threads.length === 0 ? (
        <section className="mt-8 grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="px-6 py-10 sm:px-10 sm:py-14">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MessageCircleQuestion className="size-6" aria-hidden /></span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">No questions yet</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              When a lesson leaves you stuck, open it and choose <strong className="font-medium text-foreground">Ask a question</strong>. Your mentor&apos;s answer will appear here and in that lesson.
            </p>
            <Link href="/my-courses" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Open my courses <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          <div className="flex flex-col justify-center gap-5 border-t bg-muted/25 px-6 py-8 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How it works</p>
            <p className="text-sm leading-6"><span className="mr-2 font-semibold text-muted-foreground">01</span> Ask from the lesson you are working on.</p>
            <p className="text-sm leading-6"><span className="mr-2 font-semibold text-muted-foreground">02</span> Your mentor replies in the same conversation.</p>
            <p className="text-sm leading-6"><span className="mr-2 font-semibold text-muted-foreground">03</span> Return here to read and follow up.</p>
          </div>
        </section>
      ) : <LearnerQuestionsOverview threads={threads} viewerId={user.id} initialCourse={filters.course} initialChapter={filters.chapter} initialQuestionId={filters.question} />}
    </div>
  );
}
