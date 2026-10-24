// A static, server-rendered snapshot of a lab board. It is readable before any
// client script loads and under no JavaScript at all. The editor (a later plan)
// hydrates over it. Pure SVG with theme tokens from tones.ts, no hex and no
// injected-HTML escape hatches, so it passes the SVG safety contract.

import { COMPONENT_CATALOG } from "./catalog";
import type { Board, BoardEdge, BoardNode } from "./types";
import { LABEL_HALO, NEUTRAL } from "@buildment/learning-ui/canvas/primitives/tones";

export interface StaticBoardModel {
  nodes: BoardNode[];
  edges: BoardEdge[];
  overflow: number;
  empty: boolean;
}

export function boardToStatic(board: Board, maxNodes = 12): StaticBoardModel {
  const nodes = board.nodes.slice(0, maxNodes);
  const kept = new Set(nodes.map((node) => node.id));
  const edges = board.edges.filter((edge) => kept.has(edge.from) && kept.has(edge.to));
  return {
    nodes,
    edges,
    overflow: Math.max(0, board.nodes.length - nodes.length),
    empty: board.nodes.length === 0,
  };
}

const CELL_W = 150;
const CELL_H = 90;
const NODE_W = 120;
const NODE_H = 48;
const PAD = 20;

const centerX = (node: BoardNode) => PAD + node.x * CELL_W + NODE_W / 2;
const centerY = (node: BoardNode) => PAD + node.y * CELL_H + NODE_H / 2;

export function StaticBoard({ board, maxNodes = 12 }: { board: Board; maxNodes?: number }) {
  const model = boardToStatic(board, maxNodes);

  if (model.empty) {
    return (
      <svg viewBox="0 0 320 90" role="img" aria-label="Empty board" className="w-full">
        <text x={160} y={48} textAnchor="middle" className={NEUTRAL.mutedText}>
          Nothing placed yet
        </text>
      </svg>
    );
  }

  const byId = new Map(model.nodes.map((node) => [node.id, node]));
  const maxX = Math.max(...model.nodes.map((node) => node.x));
  const maxY = Math.max(...model.nodes.map((node) => node.y));
  const width = PAD * 2 + (maxX + 1) * CELL_W;
  const height = PAD * 2 + (maxY + 1) * CELL_H + (model.overflow > 0 ? 24 : 0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Lab board" className="w-full">
      {model.edges.map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={centerX(from)}
            y1={centerY(from)}
            x2={centerX(to)}
            y2={centerY(to)}
            className={NEUTRAL.line}
            strokeWidth={1.5}
          />
        );
      })}
      {model.nodes.map((node) => {
        const label = COMPONENT_CATALOG[node.kind].label;
        const x = PAD + node.x * CELL_W;
        const y = PAD + node.y * CELL_H;
        return (
          <g key={node.id}>
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              className={`${NEUTRAL.surface} ${NEUTRAL.line}`}
              strokeWidth={1.5}
            />
            <text
              x={x + NODE_W / 2}
              y={y + NODE_H / 2 + 4}
              textAnchor="middle"
              className={`${NEUTRAL.text} ${LABEL_HALO}`}
            >
              {label}
            </text>
          </g>
        );
      })}
      {model.overflow > 0 ? (
        <text x={PAD} y={height - 8} className={NEUTRAL.mutedText}>
          {`plus ${model.overflow} more`}
        </text>
      ) : null}
    </svg>
  );
}
