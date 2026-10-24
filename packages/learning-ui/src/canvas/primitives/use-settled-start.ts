"use client";

import { useState } from "react";

/**
 * True until a beat clock first moves. A picture that replays from empty can
 * show its finished state until then, so a preview, a server render or a tab
 * that has not scrolled into view still tells the whole story. After the
 * clock has moved (or been restarted) the picture follows it as usual.
 */
export function useSettledStart(seconds: number): boolean {
  const [moved, setMoved] = useState(false);
  if (seconds > 0 && !moved) setMoved(true);
  return !moved;
}
