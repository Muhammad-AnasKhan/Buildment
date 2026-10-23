import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Clock3,
  Layers3,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Target,
  UserRound,
} from 'lucide-react';
import { coursePrice, type Course, type CourseDetail } from '../catalog';

const button =
  'rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50';

export function CoursePreview({
  course,
  onBack,
}: {
  course: Course;
  onBack: () => void;
}) {
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [state, setState] = useState<
    'loading' | 'auth' | 'ready' | 'error' | 'unverified'
  >('loading');
  const [message, setMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const live = useRef(true);
  const generation = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);

  async function load() {
    const request = ++generation.current;
    setState('loading');
    setMessage('');
    setDetail(null);
    try {
      const result = await window.buildment.courseDetail(course.slug);
      if (!live.current || generation.current !== request) return;
      if (result.ok) {
        setDetail(result.data);
        setState('ready');
        setSignedIn(true);
      } else if (result.code === 'AUTH_REQUIRED') {
        setState('auth');
        setSignedIn(false);
      } else {
        setSignedIn(true);
        setMessage(result.message);
        setState(result.code === 'EMAIL_UNVERIFIED' ? 'unverified' : 'error');
      }
    } catch {
      if (!live.current || generation.current !== request) return;
      setState('error');
      setMessage('Could not load the curriculum. Please try again.');
    }
  }

  useEffect(() => {
    live.current = true;
    heading.current?.focus({ preventScroll: true });
    void load();
    return () => {
      live.current = false;
      void window.buildment.cancelSignIn().catch(() => undefined);
      generation.current++;
    };
  }, [course.slug]);
  async function signIn() {
    setBusy(true);
    setAuthError('');
    try {
      const result = await window.buildment.signIn();
      if (!live.current) return;
      if (result.ok) {
        setSignedIn(true);
        await load();
      } else if (result.code !== 'CANCELLED') setAuthError(result.message);
    } catch {
      if (live.current)
        setAuthError('Could not open browser sign-in. Please try again.');
    } finally {
      if (live.current) setBusy(false);
    }
  }
  async function signOut() {
    generation.current++;
    setBusy(true);
    setDetail(null);
    setState('auth');
    setSignedIn(false);
    setMessage('');
    try {
      const result = await window.buildment.signOut();
      if (live.current && !result.ok) setMessage(result.message);
    } catch {
      if (live.current) {
        setSignedIn(true);
        setState('error');
        setMessage('Could not confirm sign-out. Please try again.');
      }
    } finally {
      if (live.current) setBusy(false);
    }
  }

  const current = detail || course;
  const cover =
    current.coverUrl &&
    /^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)(:|\/))/.test(
      current.coverUrl,
    )
      ? current.coverUrl
      : null;
  return (
    <div className="mx-auto max-w-[1180px] px-8 py-8 lg:px-12">
      <button
        onClick={onBack}
        className="mb-7 flex items-center gap-2 rounded text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to courses
      </button>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative flex h-48 items-center justify-center overflow-hidden bg-muted">
              {cover && !imageFailed ? (
                <img
                  src={cover}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="size-full object-cover"
                />
              ) : (
                <>
                  <div className="cover-grid absolute inset-0 opacity-60" />
                  <BookOpen
                    size={58}
                    strokeWidth={1}
                    className="relative text-primary/60"
                  />
                  <span className="absolute bottom-5 right-6 text-[10px] tracking-[0.22em] text-muted-foreground">
                    BUILDMENT / COURSE PREVIEW
                  </span>
                </>
              )}
            </div>
            <div className="p-7 lg:p-8">
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                {current.category === 'TECH'
                  ? 'Technical course'
                  : 'Soft skills'}
              </span>
              <h1
                ref={heading}
                tabIndex={-1}
                className="mt-5 text-3xl font-semibold leading-tight tracking-tight outline-none lg:text-4xl"
              >
                {current.title}
              </h1>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {current.description || 'Discover the course curriculum below.'}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm">
                <UserRound size={16} className="text-muted-foreground" />
                <span>{current.instructorName || 'Buildment'}</span>
              </div>
            </div>
          </section>
          {current.projectGoal && (
            <section className="mt-6 rounded-2xl border border-border bg-ok-soft/40 p-6">
              <div className="mb-3 flex items-center gap-2">
                <Target size={18} className="text-ok" />
                <h2 className="font-semibold">What you’ll build</h2>
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {current.projectGoal}
              </p>
            </section>
          )}

          <section aria-labelledby="curriculum-title" className="mt-9">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2
                  id="curriculum-title"
                  className="text-xl font-semibold tracking-tight"
                >
                  Course curriculum
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Explore the modules and chapters in this course.
                </p>
              </div>
              {signedIn && (
                <button
                  disabled={busy}
                  onClick={() => void signOut()}
                  className="flex shrink-0 items-center gap-1.5 rounded px-2 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              )}
            </div>
            {state === 'loading' && (
              <div
                role="status"
                className="space-y-3 rounded-2xl border border-border p-6"
              >
                <span className="text-sm text-muted-foreground">
                  Loading curriculum…
                </span>
                {[0, 1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-12 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            )}
            {state === 'auth' && (
              <div className="rounded-2xl border border-border bg-card p-7">
                <LockKeyhole size={24} className="mb-4 text-muted-foreground" />
                <h3 className="font-semibold">
                  A closer look at your next chapter
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sign in with your verified Buildment account to view the full
                  curriculum.
                </p>
                {message && (
                  <p
                    role="status"
                    className="mt-3 text-sm text-muted-foreground"
                  >
                    {message}
                  </p>
                )}
                <button
                  disabled={busy}
                  onClick={() => void signIn()}
                  className={`${button} mt-5`}
                >
                  {busy
                    ? 'Waiting for browser sign-in…'
                    : 'Sign in with browser'}
                </button>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Sign-in opens in your default browser. Return here after
                  connecting your account.
                </p>
                {busy && (
                  <button
                    onClick={() =>
                      void window.buildment
                        .cancelSignIn()
                        .catch(() =>
                          setAuthError(
                            'Could not cancel sign-in. Please try again.',
                          ),
                        )
                    }
                    className="mt-3 rounded text-sm underline underline-offset-4"
                  >
                    Cancel sign-in
                  </button>
                )}
                {authError && (
                  <p
                    role="alert"
                    className="mt-3 text-sm text-muted-foreground"
                  >
                    {authError}
                  </p>
                )}
              </div>
            )}
            {(state === 'error' || state === 'unverified') && (
              <div
                role="alert"
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-semibold">
                  {state === 'unverified'
                    ? 'Verify your email to continue'
                    : 'Curriculum unavailable'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {state === 'unverified'
                    ? 'Open the verification email from Buildment, then try again. You can still browse this course preview.'
                    : message}
                </p>
                <button
                  onClick={() => void load()}
                  disabled={busy}
                  className={`${button} mt-4 flex items-center gap-2`}
                >
                  <RefreshCw size={14} />
                  {state === 'unverified'
                    ? 'I’ve verified my email'
                    : 'Try again'}
                </button>
              </div>
            )}
            {state === 'ready' && detail && (
              <div className="space-y-3">
                {detail.modules.length ? (
                  [...detail.modules]
                    .sort((a, b) => a.order - b.order)
                    .map((module, index) => (
                      <details
                        key={module.id}
                        className="group rounded-xl border border-border bg-card"
                        open={index === 0}
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="min-w-0 flex-1 text-sm font-semibold">
                            {module.title}
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                              {module.chapters.length} chapters
                            </span>
                          </span>
                          <ChevronDown
                            size={16}
                            className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <ol className="border-t border-border px-5">
                          {[...module.chapters]
                            .sort((a, b) => a.order - b.order)
                            .map((chapter) => (
                              <li
                                key={chapter.id}
                                className="flex items-center gap-3 border-b border-border py-4 text-sm last:border-0"
                              >
                                <BookOpen
                                  size={14}
                                  className="shrink-0 text-muted-foreground"
                                />
                                <span className="flex-1">{chapter.title}</span>
                                {chapter.estimatedMinutes != null && (
                                  <span className="shrink-0 text-xs text-muted-foreground">
                                    {chapter.estimatedMinutes} min
                                  </span>
                                )}
                              </li>
                            ))}
                        </ol>
                        {!module.chapters.length && (
                          <p className="px-5 pb-5 text-sm text-muted-foreground">
                            No published chapters yet.
                          </p>
                        )}
                      </details>
                    ))
                ) : (
                  <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    The curriculum hasn’t been published yet.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
        <aside
          aria-label="Course details"
          className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-6"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            At a glance
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight">
            {coursePrice(current)}
          </p>
          <dl className="mt-6 space-y-5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Level</dt>
              <dd>{current.difficulty || 'All levels'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Layers3 size={14} />
                Modules
              </dt>
              <dd>{current.moduleCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <BookOpen size={14} />
                Chapters
              </dt>
              <dd>{current.chapterCount}</dd>
            </div>
            {current.estimatedHours != null && (
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Clock3 size={14} />
                  Duration
                </dt>
                <dd>{current.estimatedHours} hours</dd>
              </div>
            )}
          </dl>
          {detail?.access === 'active' && (
            <p className="mt-6 rounded-lg bg-ok-soft px-3 py-2 text-xs font-medium text-ok">
              You’re enrolled in this course
            </p>
          )}
          <p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
            Course preview · Browse the outline before you begin.
          </p>
        </aside>
      </div>
    </div>
  );
}
