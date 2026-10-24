import type { MachineEdge, StateMachineSpec } from "./types";

// Two fixed layouts, like the sequence diagram. The wide one draws the grid as
// authored. The narrow one turns it on its side (columns become rows), so a
// left-to-right lifecycle becomes a top-to-bottom one that fits a phone with
// room for labels beside it, and nothing scrolls sideways.

export type MachineLayout = "narrow" | "wide";

const LAYOUT = {
  narrow: { width: 340, pillW: 128, pillH: 46, gapAlong: 112, gapAcross: 150, nameSize: 13, subSize: 10.5, labelSize: 11, charW: 6.3 },
  wide: { width: 640, pillW: 128, pillH: 48, gapAlong: 130, gapAcross: 0, nameSize: 13.5, subSize: 11, labelSize: 11.5, charW: 6.6 },
} as const;

const LOOP_ROOM = 58;

type Pt = [number, number];

export type EdgeShape = {
  d: string;
  /** Middle of the edge: where the label sits and where the still dot rests. */
  mid: Pt;
  labelAnchor: "middle" | "start";
};

export function machineGeometry(spec: StateMachineSpec, layout: MachineLayout) {
  const L = LAYOUT[layout];
  const cols = Math.max(1, ...spec.states.map((s) => s.col + 1));
  const rows = Math.max(1, ...spec.states.map((s) => s.row + 1));
  const halfW = L.pillW / 2;
  const halfH = L.pillH / 2;

  let place: (col: number, row: number) => Pt;
  let height: number;

  if (layout === "wide") {
    const margin = halfW + 8;
    const colGap = cols > 1 ? (L.width - 2 * margin) / (cols - 1) : 0;
    const top = halfH + LOOP_ROOM;
    place = (col, row) => [cols > 1 ? margin + col * colGap : L.width / 2, top + row * L.gapAlong];
    height = top + (rows - 1) * L.gapAlong + halfH + 14;
  } else {
    // Columns run down the page; rows step to the right.
    const left = halfW + 6;
    const top = halfH + 10;
    place = (col, row) => [left + row * L.gapAcross, top + col * L.gapAlong];
    height = top + (cols - 1) * L.gapAlong + halfH + 14;
  }

  const byId = new Map(spec.states.map((s) => [s.id, { ...s, at: place(s.col, s.row) }]));

  /** Where the line from a pill's centre towards `to` leaves the pill. */
  const exitPoint = (from: Pt, to: Pt, pad: number): Pt => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const tx = dx === 0 ? Infinity : (halfW + pad) / Math.abs(dx);
    const ty = dy === 0 ? Infinity : (halfH + pad) / Math.abs(dy);
    const t = Math.min(tx, ty);
    return [from[0] + dx * t, from[1] + dy * t];
  };

  const hasReverse = (e: MachineEdge) => spec.edges.some((o) => o.from === e.to && o.to === e.from && o.from !== o.to);

  function edge(e: MachineEdge): EdgeShape | null {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (!a || !b) return null;
    const [ax, ay] = a.at;

    if (e.from === e.to) {
      if (layout === "wide") {
        // A loop over the top of the pill.
        const y = ay - halfH;
        return {
          d: `M ${ax - 30} ${y} C ${ax - 48} ${y - 62}, ${ax + 48} ${y - 62}, ${ax + 30} ${y - 3}`,
          mid: [ax, y - 46],
          labelAnchor: "middle",
        };
      }
      // A loop off the right side of the pill, with the label beyond it.
      const x = ax + halfW;
      return {
        d: `M ${x} ${ay - 12} C ${x + 46} ${ay - 26}, ${x + 46} ${ay + 26}, ${x + 3} ${ay + 12}`,
        mid: [x + 40, ay],
        labelAnchor: "start",
      };
    }

    let start = exitPoint(a.at, b.at, 0);
    let end = exitPoint(b.at, a.at, 3);
    if (hasReverse(e)) {
      // Two edges between the same pair: nudge each to its own side.
      const dx = b.at[0] - ax;
      const dy = b.at[1] - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * 7;
      const ny = (dx / len) * 7;
      start = [start[0] + nx, start[1] + ny];
      end = [end[0] + nx, end[1] + ny];
    }
    const mid: Pt = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
    const vertical = Math.abs(end[0] - start[0]) < 1;
    return {
      d: `M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`,
      mid,
      labelAnchor: layout === "narrow" && vertical ? "start" : "middle",
    };
  }

  /** Label box for an edge, kept inside the picture. */
  function labelBox(e: MachineEdge, shape: EdgeShape) {
    const w = e.label.length * L.charW + 14;
    const h = 20;
    if (shape.labelAnchor === "start") {
      // Beside a vertical edge or a side loop, never on top of the line.
      const x = Math.min(shape.mid[0] + 10, L.width - w - 2);
      return { x, y: shape.mid[1] - h / 2, w, h };
    }
    const x = Math.max(2, Math.min(L.width - w - 2, shape.mid[0] - w / 2));
    return { x, y: shape.mid[1] - h / 2, w, h };
  }

  return { ...L, height, byId, edge, labelBox, halfW, halfH };
}
