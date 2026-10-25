// Schematic glyphs for the lab's parts: drawn on an 18 by 18 grid with square
// line ends, a faint interior fill and small solid terminal squares where a part
// takes input or gives output. One per role, inline SVG, coloured by currentColor.

import type { ComponentKind, Role } from "./catalog";
import { roleOf } from "./catalog";

const T = ({ x, y }: { x: number; y: number }) => <rect x={x} y={y} width="2" height="2" fill="currentColor" stroke="none" />;

const GLYPHS: Record<Role, React.ReactNode> = {
  client: (<><rect x="2.5" y="3.5" width="13" height="9" fill="currentColor" fillOpacity="0.2" /><path d="M6 15.5h6M9 12.5v3" /><T x={8} y={7} /></>),
  dns: (<><rect x="2.5" y="2.5" width="13" height="13" fill="currentColor" fillOpacity="0.2" /><path d="M5.5 6.5h7M5.5 9h7M5.5 11.5h4" /><T x={11} y={11} /></>),
  cdn: (<><circle cx="9" cy="9" r="6.5" fill="currentColor" fillOpacity="0.2" /><path d="M2.5 9h13M9 2.5c-3 3-3 10 0 13M9 2.5c3 3 3 10 0 13" /></>),
  firewall: (<><rect x="2.5" y="3.5" width="13" height="11" fill="currentColor" fillOpacity="0.2" /><path d="M2.5 7.2h13M2.5 10.8h13M7 3.5v3.7M11 7.2v3.6M7 10.8v3.7" /></>),
  limiter: (<><path d="M2.5 3.5h13L10.5 10v5.5h-3V10z" fill="currentColor" fillOpacity="0.2" /><T x={2} y={1} /><T x={14} y={1} /></>),
  balancer: (<><path d="M2.5 9h4M6.5 9l5-5.5h4M6.5 9h9M6.5 9l5 5.5h4" /><rect x="1" y="8" width="2" height="2" fill="currentColor" stroke="none" /><T x={15} y={2.5} /><T x={15} y={8} /><T x={15} y={13.5} /></>),
  gateway: (<><path d="M4 2.5v13M14 2.5v13" /><path d="M1.5 9h15M13.5 6l3 3-3 3" fill="currentColor" fillOpacity="0.2" /></>),
  compute: (<><rect x="4.5" y="4.5" width="9" height="9" fill="currentColor" fillOpacity="0.2" /><path d="M7 1.5v3M11 1.5v3M7 13.5v3M11 13.5v3M1.5 7h3M1.5 11h3M13.5 7h3M13.5 11h3" /><T x={8} y={8} /></>),
  function: (<><path d="M6.5 4.5 2.5 9l4 4.5M11.5 4.5 15.5 9l-4 4.5" /><path d="M10 3.5 8 14.5" /></>),
  worker: (<><circle cx="9" cy="9" r="3.5" fill="currentColor" fillOpacity="0.2" /><path d="M9 1.5v3M9 13.5v3M1.5 9h3M13.5 9h3M3.7 3.7l2.1 2.1M12.2 12.2l2.1 2.1M3.7 14.3l2.1-2.1M12.2 5.8l2.1-2.1" /></>),
  cache: (<><path d="M2.5 6h13M2.5 12h13" /><rect x="6.5" y="3.5" width="5" height="11" fill="currentColor" fillOpacity="0.2" stroke="none" /><path d="M10 4 7.5 9H10.5L8 14" /></>),
  database: (<><path d="M3 4v10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V4" fill="currentColor" fillOpacity="0.2" /><ellipse cx="9" cy="4" rx="6" ry="2.5" fill="currentColor" fillOpacity="0.2" /><path d="M3 9c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" /></>),
  nosql: (<><rect x="2.5" y="2.5" width="5.5" height="5.5" fill="currentColor" fillOpacity="0.2" /><rect x="10" y="2.5" width="5.5" height="5.5" /><rect x="2.5" y="10" width="5.5" height="5.5" /><rect x="10" y="10" width="5.5" height="5.5" fill="currentColor" fillOpacity="0.2" /></>),
  search: (<><circle cx="7.5" cy="7.5" r="4.5" fill="currentColor" fillOpacity="0.2" /><path d="M11 11l5 5" /></>),
  queue: (<><rect x="2.5" y="3" width="10" height="3" fill="currentColor" fillOpacity="0.2" /><rect x="2.5" y="7.5" width="10" height="3" fill="currentColor" fillOpacity="0.2" /><rect x="2.5" y="12" width="10" height="3" fill="currentColor" fillOpacity="0.2" /><path d="M14 9h2.5M15 7.5l1.5 1.5-1.5 1.5" /></>),
  stream: (<><path d="M1.5 5.5c2-2 3-2 4.5 0s2.5 2 4.5 0 3-2 5.5 0M1.5 9.5c2-2 3-2 4.5 0s2.5 2 4.5 0 3-2 5.5 0M1.5 13.5c2-2 3-2 4.5 0s2.5 2 4.5 0 3-2 5.5 0" /></>),
  storage: (<><path d="M2.5 6.5 9 3l6.5 3.5v7L9 17l-6.5-3.5z" fill="currentColor" fillOpacity="0.2" /><path d="M2.5 6.5 9 10l6.5-3.5M9 10v7" /></>),
};

export function Glyph({ role, size = 18 }: { role: Role; size?: number }) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden focusable="false">
      {GLYPHS[role]}
    </svg>
  );
}

/** The glyph of a component kind. */
export function KindGlyph({ kind, size = 18 }: { kind: ComponentKind; size?: number }) {
  return <Glyph role={roleOf(kind)} size={size} />;
}
