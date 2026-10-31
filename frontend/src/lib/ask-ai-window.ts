// Rules for the floating "Ask AI" entry point, kept apart from the components so they can be tested without a browser.

/** The floating button and window show on reading chapters only, and only once quick answers are available. */
export function showFloatingAsk(input: { readerMode: "DEFAULT" | "QUIZ"; available: boolean }): boolean {
  return input.readerMode !== "QUIZ" && input.available;
}

/** Escape closes the window, unless something inside it already handled the key (for example an open select). */
export function closesWindow(event: { key: string; defaultPrevented: boolean; isComposing?: boolean }): boolean {
  return event.key === "Escape" && !event.defaultPrevented && !event.isComposing;
}

/** Where Tab goes next inside a focus trap, or null when the browser's own move stays inside. */
export function trapTarget(input: { count: number; index: number; shift: boolean }): number | null {
  const { count, index, shift } = input;
  if (count <= 0) return null;
  if (index < 0) return shift ? count - 1 : 0;
  if (shift && index === 0) return count - 1;
  if (!shift && index === count - 1) return 0;
  return null;
}

export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
