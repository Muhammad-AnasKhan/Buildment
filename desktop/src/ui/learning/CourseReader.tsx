import { useEffect, useRef, useState } from 'react';
import type { Lesson } from '../../domain/learning';
import type { QuizChapterState } from '../../../../server/src/shared/api/blocks';
import { LessonContent } from './LessonContent';
import { Exercise } from './Exercise';
import { QuizSession } from './quiz/QuizSession';
import { AccountMenu } from '../auth/AccountMenu';
import type { Session } from '../auth/useSession';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { LessonLoading } from './LessonLoading';

export function CourseReader({
  courseSlug,
  courseTitle,
  initialChapter,
  onBack,
  onSignedOut,
  session,
}: {
  courseSlug: string;
  courseTitle: string;
  initialChapter?: string;
  onBack: () => void;
  onSignedOut: () => void;
  session: Session;
}) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [quiz, setQuiz] = useState<QuizChapterState | null>(null);
  const generation = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);

  function fail(result: { code: string; message: string }) {
    setError(result.message);
    if (result.code === 'AUTH_REQUIRED') onSignedOut();
  }
  async function load(chapter: string, refresh = false) {
    const request = ++generation.current;
    if (!refresh) {
      setLoading(true);
      setLesson(null);
      setQuiz(null);
    }
    setError('');
    try {
      const result = await window.buildment.learning.lesson(
        courseSlug,
        chapter,
      );
      if (request !== generation.current) return;
      if (!result.ok) {
        fail(result);
        return;
      }
      setLesson(result.data);
      if (!result.data.locked && result.data.chapter.readerMode === 'QUIZ') {
        const quizResult = await window.buildment.learning.quiz(
          result.data.chapter.id,
        );
        if (request !== generation.current) return;
        if (!quizResult.ok) fail(quizResult);
        else {
          const state = quizResult.data as QuizChapterState;
          setQuiz(state);
        }
      }
    } catch {
      if (request === generation.current)
        setError('Could not load the lesson. Please try again.');
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }
  async function start() {
    const request = ++generation.current;
    setLoading(true);
    setError('');
    try {
      const next = await window.buildment.startLearning(courseSlug);
      if (request !== generation.current) return;
      if (!next.ok) {
        fail(next);
        setLoading(false);
        return;
      }
      if (next.data.href) {
        await load(next.data.href.split('/').pop()!);
        return;
      }
      const overview = await window.buildment.learning.overview(courseSlug);
      if (request !== generation.current) return;
      if (!overview.ok) {
        fail(overview);
        setLoading(false);
        return;
      }
      const data = overview.data as {
        syllabus?: { modules: Array<{ chapters: Array<{ slug: string }> }> };
      };
      const first = data.syllabus?.modules.flatMap(
        (module) => module.chapters,
      )[0];
      if (first) await load(first.slug);
      else {
        setError('No lessons are available for this course yet.');
        setLoading(false);
      }
    } catch {
      if (request === generation.current) {
        setError('Could not open this course. Please try again.');
        setLoading(false);
      }
    }
  }
  useEffect(() => {
    if (initialChapter) void load(initialChapter);
    else void start();
    return () => {
      generation.current++;
    };
  }, [courseSlug, initialChapter]);
  useEffect(() => {
    if (!loading) heading.current?.focus();
  }, [lesson?.chapter.id, loading]);

  async function complete() {
    if (!lesson || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await window.buildment.learning.complete(
        lesson.chapter.id,
      );
      if (!result.ok) fail(result);
      else await load(lesson.chapter.slug, true);
    } catch {
      setError('Could not save lesson completion. Try again.');
    } finally {
      setBusy(false);
    }
  }
  const refresh = () => {
    if (lesson) void load(lesson.chapter.slug, true);
  };
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-border bg-background/95 px-5 backdrop-blur lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            aria-label="Back to course preview"
            title="Back to course preview"
            onClick={onBack}
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft size={16} />
            <span>Course</span>
          </button>
          <div className="min-w-0 border-l border-border pl-5">
            <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
              Edorax <span className="px-1.5 opacity-50">/</span> Learning
            </p>
            <p className="truncate text-sm font-medium">
              {lesson?.course.title || courseTitle}
            </p>
          </div>
        </div>
        <AccountMenu session={session} />
      </header>
      {session.authError && (
        <p role="alert" className="m-5 rounded border border-border p-4">
          {session.authError}
        </p>
      )}
      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-border p-4">
          <p>{error}</p>
          <button
            className="mt-2 underline"
            onClick={() =>
              lesson ? void load(lesson.chapter.slug) : void start()
            }
          >
            Try again
          </button>
        </div>
      )}
      {loading && <LessonLoading />}
      {lesson && !loading && (
        <div className="grid grid-cols-[260px_minmax(0,1fr)] items-start xl:grid-cols-[300px_minmax(0,1fr)]">
          <nav
            aria-label="Course lessons"
            className="sticky top-[72px] h-[calc(100vh-72px)] space-y-4 overflow-y-auto border-r border-border bg-sidebar p-5"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen size={17} />
              Course curriculum
            </h2>
            {lesson.modules.map((module, moduleIndex) => (
              <details
                key={module.id}
                open={module.chapters.some(
                  (chapter) => chapter.id === lesson.chapter.id,
                )}
                className="group border-t border-border pt-4"
              >
                <summary className="mb-3 cursor-pointer text-[13px] font-medium leading-5 marker:text-muted-foreground">
                  <span className="mr-2 text-[10px] tabular-nums text-muted-foreground">
                    {String(moduleIndex + 1).padStart(2, '0')}
                  </span>
                  {module.title}
                  <span className="mt-1 block pl-4 text-[11px] font-normal text-muted-foreground">
                    {module.chapters.length} lessons
                  </span>
                </summary>
                <ul className="space-y-1">
                  {module.chapters.map((chapter) => (
                    <li key={chapter.id}>
                      <button
                        disabled={chapter.locked || busy}
                        aria-current={
                          chapter.id === lesson.chapter.id ? 'page' : undefined
                        }
                        onClick={() => void load(chapter.slug)}
                        className="w-full rounded-lg border-l-2 border-transparent px-3 py-2.5 text-left text-[13px] leading-5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:border-ok aria-[current=page]:bg-ok/10 aria-[current=page]:font-medium aria-[current=page]:text-foreground disabled:opacity-50"
                      >
                        {chapter.status === 'COMPLETED'
                          ? '✓ '
                          : chapter.locked
                            ? 'Locked · '
                            : ''}
                        {chapter.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </nav>
          <article className="mx-auto w-full min-w-0 max-w-[860px] px-7 py-10 lg:px-12 lg:py-14">
            <p className="mb-3 text-xs text-muted-foreground">
              Lesson {lesson.chapter.lessonLabel}
              {lesson.chapter.estimatedMinutes
                ? ' · ' + lesson.chapter.estimatedMinutes + ' min'
                : ''}
            </p>
            <h1
              ref={heading}
              tabIndex={-1}
              className="max-w-[24ch] text-3xl font-semibold leading-tight tracking-tight outline-none lg:text-4xl"
            >
              {lesson.chapter.title}
            </h1>
            {lesson.locked ? (
              <div className="mt-6">
                <p>
                  This lesson is locked. Finish{' '}
                  {lesson.previous?.title || 'the previous lesson'} first.
                </p>
                {lesson.previous && (
                  <button
                    className="mt-4 underline"
                    onClick={() => void load(lesson.previous!.slug)}
                  >
                    Open previous lesson
                  </button>
                )}
              </div>
            ) : (
              lesson.content && (
                <>
                  {lesson.chapter.readerMode === 'QUIZ' ? (
                    quiz ? (
                      <QuizSession
                        key={lesson.chapter.id}
                        chapterId={lesson.chapter.id}
                        state={quiz}
                        complete={lesson.content.chapterComplete}
                        onSaved={refresh}
                      />
                    ) : (
                      <p role="status">Loading quiz…</p>
                    )
                  ) : (
                    <div key={lesson.chapter.id} className="lesson-prose mt-8">
                      {lesson.content.predictGate &&
                      !lesson.content.predictRevealed ? (
                        <>
                          <p>
                            Answer the prediction before reading the lesson.
                          </p>
                          <PredictionContent
                            node={lesson.document}
                            onSaved={refresh}
                          />
                        </>
                      ) : (
                        <LessonContent
                          node={lesson.document}
                          lesson={lesson}
                          onSaved={refresh}
                        />
                      )}
                    </div>
                  )}
                  <footer className="mt-10 space-y-4 border-t border-border pt-6">
                    <p className="text-sm text-muted-foreground">
                      {lesson.content.checkpointsCompleted} /{' '}
                      {lesson.content.checkpointsTotal} checkpoints complete
                    </p>
                    {lesson.content.reflectionPending && (
                      <p>
                        Save your learning reflection to complete this lesson.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {lesson.prev && (
                        <button
                          disabled={busy}
                          onClick={() => void load(lesson.prev!.slug)}
                          className="rounded-lg border border-border px-4 py-2"
                        >
                          Previous lesson
                        </button>
                      )}
                      <button
                        disabled={busy || !lesson.content.canMarkComplete}
                        onClick={() => void complete()}
                        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
                      >
                        {lesson.content.chapterComplete
                          ? 'Lesson completed'
                          : busy
                            ? 'Saving…'
                            : 'Mark lesson complete'}
                      </button>
                      {lesson.next && (
                        <button
                          disabled={busy || lesson.content.nextLocked}
                          onClick={() => void load(lesson.next!.slug)}
                          className="rounded-lg border border-border px-4 py-2 disabled:opacity-50"
                        >
                          Next lesson
                        </button>
                      )}
                    </div>
                  </footer>
                </>
              )
            )}
          </article>
        </div>
      )}
    </div>
  );
}
function PredictionContent({
  node,
  onSaved,
}: {
  node: import('../../domain/learning').LessonNode;
  onSaved: () => void;
}) {
  const id = node.attributes?.id || node.attributes?.blockId;
  if (node.name === 'Predict' && typeof id === 'string')
    return <Exercise id={id} onSaved={onSaved} />;
  return (
    <>
      {node.children?.map((child, index) => (
        <PredictionContent key={index} node={child} onSaved={onSaved} />
      ))}
    </>
  );
}
