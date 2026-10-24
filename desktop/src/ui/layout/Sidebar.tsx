import {
  PanelLeftClose,
  PanelLeftOpen,
  LibraryBig,
  Sprout,
} from 'lucide-react';
export function Sidebar({
  collapsed,
  toggleSidebar,
  backToCourses,
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
  backToCourses: () => void;
}) {
  return (
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
  );
}
