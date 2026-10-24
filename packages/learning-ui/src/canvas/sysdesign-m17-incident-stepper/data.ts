import type { CustomCanvasSpec } from "../registry";
import { IncidentStepperCanvas } from "./IncidentStepperCanvas";

// 17.6 beat 2, "Step through an incident". Model: ./model.ts.
export const sysdesignM17IncidentStepper: CustomCanvasSpec = {
  kind: "custom",
  title: "Step through an incident",
  purpose: "Walk the evening of 19:27 one step at a time. At each step choose between two moves: the better one moves on, the poorer one shows its cost and adds 5 minutes to the clock while the error rate on the chart keeps running.",
  limits:
    "The story is a course composite for the made-up Souq Express app, and every time, rate and cost is a course number. Real incidents have more than two options at each step, and a wrong move rarely costs exactly 5 minutes. The five steps cover the habits (tell people, one lead, undo first, verify, learn without blame), not every task of an incident.",
  component: IncidentStepperCanvas,
};
