import type { CustomCanvasSpec } from "../registry";
import { CellsCanvas } from "./CellsCanvas";

// 19.2 beat 4, "Cut the system into cells". Model: ./model.ts.
export const sysdesignM19Cells: CustomCanvasSpec = {
  kind: "custom",
  title: "Cut the system into cells",
  purpose: "Drag to choose 1, 2, 4 or 10 cells, then tap the poison customer. Their bad request breaks the cell it lands in: with one cell all 100 customers are hit, with 10 cells ten are. The price is a router in front and a more careful way of running things.",
  limits: "Equal cells, one poison customer and no shared state. A shared database or config store that every cell uses would put all 100 customers back in one blast radius.",
  component: CellsCanvas,
};
