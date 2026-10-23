import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Layers3,
  Clock3,
  ArrowUpRight,
  WifiOff,
  Sprout,
  Code2,
  LibraryBig,
} from 'lucide-react';
import { coursePrice, filterCourses, type Course } from '../catalog';
import { CoursePreview } from './CoursePreview';

const categoryName = (value: string) =>
  value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function CourseCard({
  course,
  index,
  onOpen,
}: {
  course: Course;
  index: number;
  onOpen: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const cover =
    course.coverUrl &&
    /^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)(:|\/))/.test(
      course.coverUrl,
    )
      ? course.coverUrl
      : null;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-primary/5 focus-within:ring-2 focus-within:ring-ring">
      <div
        className={`course-cover relative flex h-40 items-center justify-center overflow-hidden ${index % 2 ? 'bg-muted' : 'bg-ok-soft'}`}
      >
        {cover && !imageFailed ? (
          <img
            src={cover}
            onError={() => setImageFailed(true)}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute size-full object-cover"
          />
        ) : (
          <>
            <div className="cover-grid absolute inset-0 opacity-40" />
            <div className="relative flex size-20 -rotate-6 items-center justify-center rounded-2xl border border-border/80 bg-card/65 text-primary shadow-sm">
              <Code2 size={38} strokeWidth={1.3} />
            </div>
            <span className="absolute right-5 bottom-4 font-mono text-[10px] tracking-[0.2em] text-primary/60">
              BUILDMENT / {String(index + 1).padStart(2, '0')}
            </span>
          </>
        )}
        <span className="absolute left-4 top-4 rounded-full border border-border/60 bg-card/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-primary">
          {categoryName(course.category)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-ok" />
          {course.difficulty || 'All levels'}
          {course.estimatedHours != null && (
            <>
              <span className="mx-1">·</span>
              <Clock3 size={12} />
              {course.estimatedHours} hours
            </>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
          {course.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {course.description ||
            'Explore this course and build your skills through practice.'}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers3 size={13} />
            {course.moduleCount} modules
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={13} />
            {course.chapterCount} chapters
          </span>
        </div>
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="truncate text-xs text-muted-foreground">
              {course.instructorName || 'Buildment'}
            </span>
            <span className="text-sm font-semibold text-primary">
              {coursePrice(course)}
            </span>
          </div>
          <button
            id={`preview-${course.id}`}
            onClick={onOpen}
            aria-label={`Preview ${course.title}`}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-primary after:absolute after:inset-0"
          >
            Preview course
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function App() {
  const [selected, setSelected] = useState<Course | null>(null);
  const main = useRef<HTMLElement>(null);
  const catalogScroll = useRef(0);
  function openCourse(course: Course) {
    catalogScroll.current = main.current?.scrollTop || 0;
    setSelected(course);
    if (main.current) main.current.scrollTop = 0;
  }
  function backToCourses() {
    const id = selected?.id;
    setSelected(null);
    requestAnimationFrame(() => {
      if (main.current) main.current.scrollTop = catalogScroll.current;
      if (id)
        document
          .getElementById(`preview-${id}`)
          ?.focus({ preventScroll: true });
    });
  }
  useEffect(() => {
    document.documentElement.dataset.appReady = 'true';
    document.getElementById('startup-status')?.setAttribute('hidden', '');
  }, []);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await window.buildment.listCourses();
      if (result.ok) setCourses(result.courses);
      else setError(result.message);
    } catch {
      setError(
        'The desktop connection is unavailable. Restart the app and try again.',
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const visible = filterCourses(courses, query, category);
  const categories = [...new Set(courses.map((course) => course.category))];

  function toggleSidebar() {
    setCollapsed((value) => {
      try {
        localStorage.setItem('sidebar-collapsed', String(!value));
      } catch {
        /* The sidebar still works if local preferences cannot be saved. */
      }
      return !value;
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside
        className={`flex shrink-0 flex-col border-r border-border bg-sidebar text-foreground transition-[width] duration-200 ${collapsed ? 'w-[76px]' : 'w-[220px]'}`}
        aria-label="Main navigation"
      >
        <div
          className={`flex h-24 items-center ${collapsed ? 'justify-center' : 'gap-3 px-6'}`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-bold tracking-tighter text-primary-foreground">
            b.
          </span>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight">
              buildment
              <span className="mt-0.5 block text-[9px] font-normal uppercase tracking-[0.25em] text-muted-foreground">
                Learning workspace
              </span>
            </span>
          )}
        </div>
        <div className={collapsed ? 'px-3' : 'px-4'}>
          {!collapsed && (
            <p className="mb-3 px-3 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Your workspace
            </p>
          )}
          <button
            aria-current="page"
            title="Courses"
            onClick={backToCourses}
            className={`flex w-full items-center rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground ${collapsed ? 'justify-center' : 'gap-3 px-3'}`}
          >
            <LibraryBig size={18} />
            {!collapsed && 'Courses'}
          </button>
        </div>
        {!collapsed && (
          <div className="mx-5 mt-auto mb-5 rounded-xl border border-border p-4">
            <Sprout className="mb-3 text-ok" size={24} strokeWidth={1.4} />
            <p className="text-sm leading-relaxed text-foreground">
              Small steps.
              <br />
              Real progress.
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Make room for something new today.
            </p>
          </div>
        )}
        <div
          className={`border-t border-border p-4 ${collapsed ? 'mt-auto' : ''}`}
        >
          <button
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <>
                <PanelLeftClose size={17} />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <main ref={main} className="min-w-0 flex-1 overflow-y-auto">
        <header className="flex h-[72px] items-center justify-between border-b border-border bg-card/70 px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Workspace</span>
            <span className="text-border">/</span>
            <button
              onClick={backToCourses}
              className="rounded font-medium text-foreground"
            >
              Courses
            </button>
            {selected && (
              <>
                <span>/</span>
                <span>Course preview</span>
              </>
            )}
          </div>
          <span className="rounded-full border border-border px-3 py-1.5 text-[10px] font-medium tracking-wide text-muted-foreground">
            BUILDMENT DESKTOP
          </span>
        </header>
        {selected ? (
          <CoursePreview
            key={selected.slug}
            course={selected}
            onBack={backToCourses}
          />
        ) : (
          <div className="mx-auto max-w-[1320px] px-8 py-9 lg:px-12">
            <section className="relative mb-9 overflow-hidden rounded-2xl border border-border bg-muted p-8 lg:p-10">
              <div className="relative z-10 lg:max-w-[75%]">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Learn. Build. Make it yours.
                </p>
                <h1 className="font-display text-4xl leading-[1.15] tracking-tight text-primary lg:text-[46px]">
                  Your next chapter
                  <br />
                  <span className="italic">starts here.</span>
                </h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                  Explore practical courses. Build your understanding.
                  <br className="hidden lg:block" /> Turn what you learn into
                  something real.
                </p>
              </div>
              <div
                aria-hidden="true"
                className="absolute right-7 top-1/2 hidden size-60 -translate-y-1/2 items-center justify-center rounded-full border border-primary/10 lg:flex"
              >
                <div className="flex size-44 items-center justify-center rounded-full border border-primary/10">
                  <div className="flex size-28 rotate-[-12deg] items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/10">
                    <BookOpen size={48} strokeWidth={1.1} />
                  </div>
                </div>
                <ArrowUpRight
                  size={24}
                  className="absolute top-5 right-8 text-primary/50"
                />
              </div>
            </section>

            <section aria-labelledby="courses-title">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2
                      id="courses-title"
                      className="text-xl font-semibold tracking-tight"
                    >
                      Explore courses
                    </h2>
                    {!loading && !error && (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {courses.length}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Find something worth getting curious about.
                  </p>
                </div>
                <button
                  onClick={() => void load()}
                  disabled={loading}
                  aria-label="Refresh courses"
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-primary disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? 'animate-spin' : ''}
                  />
                  Refresh
                </button>
              </div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div
                  aria-label="Course categories"
                  className="flex flex-wrap gap-2"
                >
                  {['all', ...categories].map((value) => (
                    <button
                      key={value}
                      aria-pressed={category === value}
                      onClick={() => setCategory(value)}
                      className={`rounded-lg px-4 py-2.5 text-xs font-medium transition-colors ${category === value ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:border-ok'}`}
                    >
                      {value === 'all' ? 'All courses' : categoryName(value)}
                    </button>
                  ))}
                </div>
                <label className="flex min-w-52 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-muted-foreground">
                  <Search size={15} />
                  <input
                    aria-label="Search courses"
                    placeholder="Search courses…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-44 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70"
                  />
                </label>
              </div>

              {loading ? (
                <div
                  role="status"
                  aria-label="Loading courses"
                  className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                >
                  {[1, 2, 3].map((key) => (
                    <div
                      key={key}
                      className="h-96 animate-pulse rounded-2xl border border-border bg-card"
                    >
                      <div className="h-40 rounded-t-2xl bg-[#e8ece5]" />
                      <div className="space-y-4 p-5">
                        <div className="h-4 w-1/3 rounded bg-background" />
                        <div className="h-6 w-4/5 rounded bg-background" />
                        <div className="h-14 rounded bg-background" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-border bg-card px-6 py-12 text-center"
                >
                  <WifiOff
                    className="mx-auto mb-4 text-muted-foreground"
                    size={28}
                  />
                  <h3 className="font-semibold">
                    We couldn’t load your courses
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {error}
                  </p>
                  <button
                    onClick={() => void load()}
                    className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground"
                  >
                    Try again
                  </button>
                </div>
              ) : !visible.length ? (
                <div
                  role="status"
                  className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center"
                >
                  <BookOpen className="mx-auto mb-4 text-ok" size={28} />
                  <h3 className="font-semibold">
                    {courses.length
                      ? 'No matching courses'
                      : 'A new chapter is on its way'}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {courses.length
                      ? 'Try another search or choose a different category.'
                      : 'Published courses will appear here when they are available.'}
                  </p>
                  {courses.length > 0 && (
                    <button
                      onClick={() => {
                        setQuery('');
                        setCategory('all');
                      }}
                      className="mt-5 text-sm font-semibold text-primary underline underline-offset-4"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {visible.map((course, index) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      index={index}
                      onOpen={() => openCourse(course)}
                    />
                  ))}
                </div>
              )}
              <p
                aria-live="polite"
                className="mt-6 text-xs text-muted-foreground"
              >
                {!loading && !error
                  ? `${visible.length} ${visible.length === 1 ? 'course' : 'courses'} available${query || category !== 'all' ? ' with these filters' : ' to explore'}`
                  : '\u00a0'}
              </p>
            </section>
            <footer className="mt-10 flex items-center justify-between border-t border-border pt-5 text-[10px] text-muted-foreground/70">
              <span>Made for the way you learn.</span>
              <span>Buildment · Learning workspace</span>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
