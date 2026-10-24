import type { CustomCanvasSpec } from "../registry";
import { CloudExplorerCanvas } from "./CloudExplorerCanvas";

// 18.7 beat 3, "Play: pick a block for each need". Model: ./model.ts.
export const sysdesignM18CloudExplorer: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick a cloud block for each need",
  purpose: "Tap a need on the left, then tap a block on the right. The panel names the AWS service, says what you manage and what the provider manages, and shows a made-up monthly price: green for the best fit, amber for one that works, red for a wrong shape.",
  limits: "The prices are made up and round, not AWS prices: real prices change often, differ by region and add fees for data moved out. Each need has one best block and one acceptable block; real designs often combine several, and the best choice also depends on your team's skills. Free tiers, discounts for committing in advance and the work of setting each block up are left out.",
  component: CloudExplorerCanvas,
};
