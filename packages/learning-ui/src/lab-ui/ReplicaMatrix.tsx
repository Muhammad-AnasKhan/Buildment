import { loadState } from "./bench";

/**
 * The replica core matrix: one cell per running machine, each filling with the load
 * the machines share, so adding a copy visibly lowers every cell. A single machine
 * shows an eight-segment rack. A lost machine is a crossed-out cell.
 */
export function ReplicaMatrix({ units, load, lost = false }: { units: number; load: number; lost?: boolean }) {
  const state = loadState(load);
  const single = units <= 1;
  const cells = single ? 8 : Math.min(units, 8);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: cells }, (_, i) => {
        // A single machine fills its rack segment by segment; copies each fill their own height.
        const fill = single ? Math.max(0, Math.min(1, load * 8 - i)) : Math.min(1, load);
        return (
          <span key={i} className="relative h-3 min-w-[6px] flex-1 overflow-hidden rounded-[3px] border border-[color:var(--lab-grid)] bg-[color:var(--lab-recessed)]">
            <span className="absolute inset-x-0 bottom-0 transition-all duration-300" style={{ height: `${fill * 100}%`, backgroundColor: state.fill }} />
          </span>
        );
      })}
      {!single && units > cells ? <span className="lab-mono text-[9px] text-muted-foreground">+{units - cells}</span> : null}
      {lost ? (
        <span className="relative flex h-3 min-w-[6px] flex-1 items-center justify-center rounded-[3px] border border-[color:var(--lab-down)] bg-[color:var(--lab-down-fill)] text-[color:var(--lab-down-ink)]">
          <svg viewBox="0 0 8 8" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"><path d="M1 1l6 6M7 1 1 7" /></svg>
        </span>
      ) : null}
    </div>
  );
}
