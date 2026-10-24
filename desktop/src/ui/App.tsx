import { useEffect, useRef, useState } from 'react';
import { filterCourses, type Course } from '../domain/catalog';
import { CourseReader } from './learning/CourseReader';
import { CoursePreview } from './courses/CoursePreview';
import { CourseCatalog } from './courses/CourseCatalog';
import { Sidebar } from './layout/Sidebar';
import { WorkspaceHeader } from './layout/WorkspaceHeader';
import { useSession } from './auth/useSession';

export function App() {
  const [selected, setSelected] = useState<Course | null>(null);
  const [reading, setReading] = useState(false);
  const session = useSession();
  const { signedIn, setSignedIn, authBusy, authRevision, changeSession } =
    session;
  useEffect(() => {
    if (!signedIn) setReading(false);
  }, [signedIn]);
  const main = useRef<HTMLElement>(null);
  const catalogScroll = useRef(0);
  function openCourse(course: Course) {
    catalogScroll.current = main.current?.scrollTop || 0;
    setSelected(course);
    if (main.current) main.current.scrollTop = 0;
  }
  function backToCourses() {
    const id = selected?.id;
    setReading(false);
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
      {!(reading && signedIn) && (
        <Sidebar
          collapsed={collapsed}
          toggleSidebar={toggleSidebar}
          backToCourses={backToCourses}
        />
      )}

      <main ref={main} className="min-w-0 flex-1 overflow-y-auto">
        {!(reading && signedIn) && (
          <WorkspaceHeader
            selected={Boolean(selected)}
            reading={reading && signedIn}
            backToCourses={backToCourses}
            session={session}
          />
        )}
        {selected && reading && signedIn ? (
          <CourseReader
            key={selected.slug + ':' + authRevision}
            courseSlug={selected.slug}
            session={session}
            onBack={() => setReading(false)}
            onSignedOut={() => {
              setSignedIn(false);
              setReading(false);
            }}
          />
        ) : selected ? (
          <CoursePreview
            key={selected.slug}
            course={selected}
            signedIn={signedIn}
            busy={authBusy}
            authRevision={authRevision}
            onSignIn={() => void changeSession(true)}
            onSession={setSignedIn}
            onStart={() => setReading(true)}
          />
        ) : (
          <CourseCatalog
            {...{
              courses,
              visible,
              categories,
              loading,
              error,
              query,
              category,
              setQuery,
              setCategory,
              load,
              openCourse,
            }}
          />
        )}
      </main>
    </div>
  );
}
