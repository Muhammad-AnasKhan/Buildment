import type { CustomCanvasSpec } from "../registry";
import { SloWindowCanvas } from "./SloWindowCanvas";

// 17.3 beat 4, "Pick a target and a window". Model: ./model.ts.
export const sysdesignM17SloWindow: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick a target and a window",
  purpose: "Drag the SLO target along the rail and choose a window. The allowed bad time is a sliver at the end of the window; each extra nine cuts it ten times, and a 25 minute outage either fits inside it or busts it.",
  limits:
    "Allowed bad minutes are (1 - target) x days x 1,440, as if the service were fully down while it is bad; a service that is half broken spends the budget more slowly. The 25 minute outage is a course number (the same one as the budget-spend scene). The sliver on the window bar is never drawn narrower than 3 units, so a 4.3 minute allowance stays visible; its true width is much smaller than the bar shows.",
  component: SloWindowCanvas,
};
