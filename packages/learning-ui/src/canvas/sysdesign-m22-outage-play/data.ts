import type { CustomCanvasSpec } from "../registry";
import { OutagePlayCanvas } from "./OutagePlayCanvas";

// 22.5 beat 5: drag the outage, drop the stale. Model: models/dardasha-outage.ts.
// Course numbers: models/dardasha-numbers.ts.
export const sysdesignM22OutagePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the outage, drop the stale",
  purpose: "Drag the length of an SMS outage and choose how old a login code may get before it is dropped. The queue grows while the provider is down, then shrinks only by the spare capacity. Dropping stale codes clears it much sooner.",
  limits:
    "Dardasha is made up and so are its numbers: 100 login codes arrive every second, the provider sends none during the outage and 150 a second afterwards. The model is a first-in, first-out queue worked out one second at a time, with no randomness. It leaves out the retries a recovering provider also sees, people who ask for a second code while they wait (which makes arrivals higher than 100), several providers, and queues kept apart by priority.",
  component: OutagePlayCanvas,
};
