import { ArrowLeft } from 'lucide-react';
import { AccountMenu } from '../auth/AccountMenu';
import type { Session } from '../auth/useSession';
export function WorkspaceHeader({
  selected,
  reading = false,
  backToCourses,
  session,
}: {
  selected: boolean;
  reading?: boolean;
  backToCourses: () => void;
  session: Session;
}) {
  const { authBusy, authError, setAuthError } = session;
  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {selected && (
            <button
              onClick={backToCourses}
              aria-label="Back to courses"
              title="Back to courses"
              className="mr-2 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft size={17} />
            </button>
          )}
          <span className="hidden md:inline">Workspace</span>
          <span className="hidden text-border md:inline">/</span>
          <button
            onClick={backToCourses}
            className="rounded font-medium text-foreground"
          >
            Courses
          </button>
          {selected && (
            <>
              <span>/</span>
              <span className="whitespace-nowrap">
                {reading ? 'Learning' : 'Course'}
              </span>
            </>
          )}
        </div>
        <AccountMenu session={session} />
      </header>
      {(authError || authBusy) && (
        <div className="sticky top-[72px] z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-8 py-3 text-sm">
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
