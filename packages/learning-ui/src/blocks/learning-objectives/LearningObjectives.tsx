import { LearningObjectivesView } from "./LearningObjectivesView";

export function LearningObjectives({ id, objectives, items }: { id?: string; objectives?: string[]; items?: string[] }) {
  const list = objectives ?? items;
  return list?.length ? <LearningObjectivesView id={id} objectives={list} /> : null;
}
