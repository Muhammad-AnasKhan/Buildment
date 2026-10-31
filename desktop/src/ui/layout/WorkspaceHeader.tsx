import { DesktopToolbar } from './DesktopToolbar';
import { ArrowLeft } from 'lucide-react';
import { AccountMenu } from '../auth/AccountMenu';
import type { Session } from '../auth/useSession';
export function WorkspaceHeader({
  selected,
  courseTitle,
  backToCourses,
  session,
}: {
  selected: boolean;
  courseTitle?: string;
  backToCourses: () => void;
  session: Session;
}) {
  const { authBusy, authError, setAuthError } = session;
  return (
    <>
      <DesktopToolbar>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {selected && (
            <button
              onClick={backToCourses}
              aria-label="Back to courses"
              title="Back to courses"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="min-w-0 select-none">
            <p className="truncate text-[13px] font-semibold leading-5">
              {selected ? courseTitle || 'Course' : 'Courses'}
            </p>
            <p className="text-[11px] leading-4 text-muted-foreground">
              Edorax
            </p>
          </div>
        </div>
        <AccountMenu session={session} />
      </DesktopToolbar>
      {(authError || authBusy) && (
        <div className="shrink-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-8 py-3 text-sm">
          <p role={authError ? 'alert' : 'status'}>
            {authError || 'Complete sign-in in your browser, then return here.'}
          </p>
          {authBusy ? (
            <button
              onClick={() =>
                void window.buildment
                  .cancelSignIn()
                  .catch(() =>
                    setAuthError('Could not cancel sign-in. Please try again.'),
                  )
              }
              className="underline underline-offset-4"
            >
              Cancel sign-in
            </button>
          ) : (
            <button
              onClick={() => setAuthError('')}
              className="underline underline-offset-4"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </>
  );
}
