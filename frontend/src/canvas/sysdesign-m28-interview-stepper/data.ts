import type { CustomCanvasSpec } from "../registry";
import { InterviewStepperCanvas } from "./InterviewStepperCanvas";

// 28.2 beat 1: a 45-minute round in six boxes of time. Model: models/interview-plan.ts,
// which feeds the house design stepper.
export const sysdesignM28InterviewStepper: CustomCanvasSpec = {
  kind: "custom",
  title: "Six boxes fill 45 minutes",
  purpose: "Six steps fill a 45-minute round: clarify 5, numbers 5, sketch 10, deep dive 15, cost and failure 7, wrap-up 3. At the sketch step, drawing 8 minutes longer cuts the deep dive to 7 minutes.",
  limits:
    "The minute counts are the course's plan, not a rule from any company. Real rounds vary in length and in how much the interviewer talks. The board chips come from Wasla, the made-up link shortener of module 20.",
  component: InterviewStepperCanvas,
};
