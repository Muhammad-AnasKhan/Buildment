// Pure glue between the HLD board UI and the tiered-architecture model. Holds the
// learner's editable state (offered load plus each node's properties) seeded from
// catalog defaults, and applies it back onto a board so the model can run on it.

import type { Board } from "./types";
import { COMPONENT_CATALOG } from "./catalog";

export type NodeConfig = Record<string, number | string>;

export interface BoardControls {
  load: number;
  perNode: Record<string, NodeConfig>;
}

export function initialControls(board: Board, load = 1000): BoardControls {
  const perNode: Record<string, NodeConfig> = {};
  for (const node of board.nodes) {
    const cfg: NodeConfig = {};
    for (const property of COMPONENT_CATALOG[node.kind].properties) cfg[property.id] = property.default;
    Object.assign(cfg, node.props ?? {});
    perNode[node.id] = cfg;
  }
  return { load, perNode };
}

export function applied(board: Board, controls: BoardControls): Board {
  return {
    ...board,
    nodes: board.nodes.map((node) => ({
      ...node,
      props: { ...(node.props ?? {}), ...(controls.perNode[node.id] ?? {}) },
    })),
  };
}
