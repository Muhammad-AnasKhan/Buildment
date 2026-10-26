"use client";

import { useCallback, useRef } from "react";
import {
  Checklist as SharedChecklist,
  ChecklistProvider as SharedChecklistProvider,
  type ChecklistItemData,
} from "@buildment/learning-ui/components/learn/checklist";
import { playFeedback } from "@/lib/sound-feedback";
import { saveChecklistItem } from "@/server/actions/progress";

export type { ChecklistItemData };
export const Checklist = SharedChecklist;

export function ChecklistProvider({
  chapterId,
  initialChecks,
  children,
}: {
  chapterId: string;
  initialChecks: Record<string, boolean>;
  children: React.ReactNode;
}) {
  const checks = useRef(initialChecks);
  const onToggle = useCallback(async (itemId: string, checked: boolean) => {
    if (checked) {
      const otherCount = Object.values(checks.current).filter(Boolean).length;
      playFeedback(otherCount === Object.keys(checks.current).length - 1 ? "celebration" : "tick");
    }
    const result = await saveChecklistItem({ chapterId, itemId, checked });
    if (!result.ok) throw new Error(result.error);
    checks.current = { ...checks.current, [itemId]: checked };
  }, [chapterId]);

  return (
    <SharedChecklistProvider initialChecks={initialChecks} onToggle={onToggle}>
      {children}
    </SharedChecklistProvider>
  );
}
