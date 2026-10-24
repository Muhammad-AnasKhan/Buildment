import { SkillSlotTimeCanvas } from "./SkillSlotTimeCanvas";

export const skillSlotYourTimeTheirTime = {
  kind: "custom" as const,
  title: "Your time, their time",
  purpose: "See how a weekly local rule becomes a dated UTC instant and a different viewer label across a clock change.",
  limits: "The canvas resolves Monday 09:00 in two example weeks. It does not resolve nonexistent or repeated local times, booking holds, or stale time-zone data.",
  component: SkillSlotTimeCanvas,
};
