import type { SequenceSpec, SequenceStep } from "./types";

// Two fixed layouts instead of one scaled picture: a narrow one for phones
// and a wide one from sm up. CSS shows one of them, so text stays readable at
// 375px without sideways scrolling and nothing is measured in JavaScript.

export type SequenceLayout = "narrow" | "wide";

const LAYOUT = {
  narrow: { width: 340, pillMax: 96, pillH: 46, rowGap: 52, nameSize: 12, subSize: 10, labelSize: 11.5, charW: 6.4 },
  wide: { width: 640, pillMax: 128, pillH: 46, rowGap: 48, nameSize: 13, subSize: 11, labelSize: 12, charW: 6.7 },
} as const;

export type SequenceGeometry = ReturnType<typeof sequenceGeometry>;

export function sequenceGeometry(spec: SequenceSpec, layout: SequenceLayout) {
  const L = LAYOUT[layout];
  const n = Math.max(spec.actors.length, 1);
  const pillW = Math.min(L.pillMax, (L.width - 8) / n - 6);
  const pad = pillW / 2 + 4;
  const span = L.width - 2 * pad;
  const laneX = (i: number) => (n === 1 ? L.width / 2 : pad + (i * span) / (n - 1));
  const headerY = 6;
  const rowY0 = headerY + L.pillH + 44;
  const rowY = (i: number) => rowY0 + i * L.rowGap;
  const height = rowY0 + Math.max(spec.steps.length - 1, 0) * L.rowGap + 24;

  /** Keep a centred label inside the picture. */
  const clampLabelX = (x: number, label: string) => {
    const half = (label.length * L.charW) / 2 + 4;
    return Math.max(half, Math.min(L.width - half, x));
  };

  function arrow(step: SequenceStep, index: number) {
    const y = rowY(index);
    const x1 = laneX(step.from);
    if (step.from === step.to) {
      // A loop beside the lane, with its label on whichever side has room.
      const labelW = step.label.length * L.charW;
      const roomRight = x1 + 52 + labelW <= L.width;
      const roomLeft = x1 - 52 - labelW >= 0;
      const dir = roomRight || !roomLeft ? 1 : -1;
      const d = `M ${x1 + dir * 4} ${y - 10} C ${x1 + dir * 46} ${y - 18}, ${x1 + dir * 46} ${y + 18}, ${x1 + dir * 8} ${y + 10}`;
      const apex: [number, number] = [x1 + dir * 36, y];
      const label =
        roomRight || roomLeft
          ? ({ x: x1 + dir * 52, y: y + 4, anchor: dir === 1 ? "start" : "end" } as const)
          : ({ x: clampLabelX(x1, step.label), y: y - 22, anchor: "middle" } as const);
      return { d, mid: apex, badge: apex, label };
    }
    const x2 = laneX(step.to);
    const dir = x2 > x1 ? 1 : -1;
    const d = `M ${x1 + dir * 4} ${y} L ${x2 - dir * 7} ${y}`;
    const mid: [number, number] = [(x1 + x2) / 2, y];
    return { d, mid, badge: mid, label: { x: clampLabelX(mid[0], step.label), y: y - 15, anchor: "middle" } as const };
  }

  return { ...L, pillW, laneX, headerY, rowY, height, arrow };
}
