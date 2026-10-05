export function checkpointAttrs(id: string, done: boolean) {
  return {
    id: `checkpoint-${id}`,
    "data-checkpoint": done ? "done" : "open",
  } as const;
}

export function scrollToNextCheckpoint() {
  const open = document.querySelector<HTMLElement>("[data-checkpoint='open']");
  const target = open ?? document.getElementById("quiz-chapter-session");
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}
