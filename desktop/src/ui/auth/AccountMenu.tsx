import { UserRound, LogOut } from 'lucide-react';
import type { Session } from './useSession';
export function AccountMenu({ session }: { session: Session }) {
  const { signedIn, authBusy, changeSession } = session;
  return (
    <div className="relative shrink-0">
      {signedIn ? (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium [&::-webkit-details-marker]:hidden">
            <UserRound size={16} /> Profile
          </summary>
          <div className="absolute right-0 top-12 w-52 rounded-xl border border-border bg-card p-3 shadow-lg">
            <p className="px-2 py-2 text-xs text-muted-foreground">
              Connected to Buildment
            </p>
            <button
              disabled={authBusy}
              onClick={() => void changeSession(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted disabled:opacity-50"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </details>
      ) : (
        <button
          disabled={authBusy}
          onClick={() => void changeSession(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          <UserRound size={16} /> {authBusy ? 'Connecting…' : 'Sign in'}
        </button>
      )}
    </div>
  );
}
