import type { ReactNode } from 'react';

/** Native window chrome stays in the desktop host; course UI stays shared. */
export function DesktopToolbar({ children }: { children: ReactNode }) {
  return (
    <header
      className="desktop-toolbar"
      data-platform={window.buildment?.platform}
      aria-label="Window toolbar"
    >
      {children}
    </header>
  );
}
