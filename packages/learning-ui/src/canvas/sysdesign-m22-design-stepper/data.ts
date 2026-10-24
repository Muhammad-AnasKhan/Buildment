import type { CustomCanvasSpec } from "../registry";
import { DesignStepperCanvas } from "./DesignStepperCanvas";

// 22.2 beat 3: Dardasha's design stepped at peak. Model: models/dardasha-design.ts,
// which feeds the house design stepper. Course numbers: models/dardasha-numbers.ts.
export const sysdesignM22DesignStepper: CustomCanvasSpec = {
  kind: "custom",
  title: "Step through the design at peak",
  purpose: "Five steps take Dardasha's design from one box to gateways, a split store, a registry and a push queue with a notifier, with a pill on the block under stress showing how many times its plan it carries.",
  limits:
    "Dardasha is made up and its numbers are course assumptions: 13,889 messages, 41,667 deliveries and 3,125 presence changes a second at peak, 3 million open lines, a gateway planned at 50,000 lines, a chat server at 2,000 messages a second, a store node at 2,500 writes a second and a registry node at 50,000 operations a second. The picture draws one store card with its partitions as small boxes and one registry card for its two nodes. It leaves out three copies of every partition, the balancer in front of the gateways, uneven partitions, groups, and the cost of the extra machines.",
  component: DesignStepperCanvas,
};
