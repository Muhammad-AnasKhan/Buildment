"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CheckCircle2, ListChecks, PartyPopper } from "lucide-react";
import { fireMiniConfetti } from "@/components/learn/mini-confetti";
import { saveChecklistItem } from "@/server/actions/progress";

export type ChecklistItemData = {
  id: string;
  label: string;
  defaultChecked?: boolean;
};

type ChecklistContextValue = {
  chapterId: string;
  initialChecks: Record<string, boolean>;
};

const ChecklistContext = createContext<ChecklistContextValue | null>(null);

export function ChecklistProvider({
  chapterId,
  initialChecks,
  children,
}: {
  chapterId: string;
  initialChecks: Record<string, boolean>;
  children: React.ReactNode;
}) {
  return (
    <ChecklistContext.Provider value={{ chapterId, initialChecks }}>
      {children}
    </ChecklistContext.Provider>
  );
}

function parseLabel(label: string) {
  const parts = label.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] text-neutral-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function ChecklistItemRow({
  item,
  checked,
  onToggle,
}: {
  item: ChecklistItemData;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <li>
      <label
        className={cn(
          "group flex cursor-pointer items-start gap-3.5 rounded-xl px-3 py-3.5 transition-colors",
          "hover:bg-white/80",
          checked && "bg-emerald-50/50 hover:bg-emerald-50/70"
        )}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onToggle(value === true)}
          className={cn(
            "mt-0.5 size-5 rounded-md border-2",
            checked && "border-emerald-600 bg-emerald-600"
          )}
          aria-label={item.label.replace(/\*\*/g, "")}
        />
        <span
          className={cn(
            "min-w-0 flex-1 text-[15px] leading-relaxed text-neutral-800",
            checked && "text-neutral-500 line-through decoration-neutral-400/80"
          )}
        >
          {parseLabel(item.label)}
        </span>
        {checked ? (
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-emerald-600 opacity-100 transition-opacity"
            aria-hidden
          />
        ) : (
          <span className="mt-0.5 size-4 shrink-0" aria-hidden />
        )}
      </label>
    </li>
  );
}

/** Shared card styling — gate and section checklists use the same look (see 2.16 verify). */
const CARD_STYLES = {
  border: "border-neutral-200",
  headerBg: "bg-neutral-50",
  headerText: "text-neutral-900",
  subText: "text-neutral-500",
  iconBg: "bg-indigo-100",
  bodyBg: "bg-white",
  progress: "bg-neutral-100",
  progressFill: "bg-emerald-500",
  badge: "bg-neutral-200 text-neutral-700",
} as const;

export function Checklist({
  items,
  section,
  variant = "inline",
  isGate = false,
}: {
  items: ChecklistItemData[];
  section?: string;
  variant?: "gate" | "section" | "inline";
  isGate?: boolean;
}) {
  const ctx = useContext(ChecklistContext);
  const chapterId = ctx?.chapterId;
  const initialChecks = ctx?.initialChecks ?? {};
  const cardRef = useRef<HTMLDivElement>(null);
  const confettiFiredRef = useRef(false);

  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of items) {
      initial[item.id] = initialChecks[item.id] ?? item.defaultChecked ?? false;
    }
    return initial;
  });

  const toggle = useCallback(
    (id: string, next: boolean) => {
      setCheckedMap((prev) => ({ ...prev, [id]: next }));
      if (!chapterId) return;
      void saveChecklistItem({ chapterId, itemId: id, checked: next });
    },
    [chapterId]
  );

  const checkedCount = useMemo(
    () => items.filter((item) => checkedMap[item.id]).length,
    [items, checkedMap]
  );
  const total = items.length;
  const progress = total > 0 ? (checkedCount / total) * 100 : 0;
  const allDone = total > 0 && checkedCount === total;

  useEffect(() => {
    if (!allDone || confettiFiredRef.current || !cardRef.current) return;
    confettiFiredRef.current = true;
    fireMiniConfetti(cardRef.current);
  }, [allDone]);

  // Legacy `variant="gate"` from older compiles maps to the same card as section/inline.
  const showSectionTitle = Boolean(section) || variant === "section";
  const gateMode = isGate || variant === "gate";

  const headerTitle = showSectionTitle
    ? section ?? (gateMode ? "Chapter gate checklist" : "Checklist")
    : section ?? "Checklist";

  const label = gateMode ? "Gate checklist" : "Checklist";

  return (
    <div
      ref={cardRef}
      className={cn(
        "not-prose my-8 overflow-hidden rounded-2xl border shadow-sm",
        CARD_STYLES.border,
        CARD_STYLES.bodyBg
      )}
      data-checklist
      data-checklist-variant={gateMode ? "gate" : variant}
    >
      <div className={cn("border-b border-neutral-200 px-5 py-4", CARD_STYLES.headerBg)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                CARD_STYLES.iconBg
              )}
            >
              <ListChecks className="size-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                {label}
              </p>
              <p className={cn("mt-0.5 text-base font-semibold leading-snug", CARD_STYLES.headerText)}>
                {headerTitle}
              </p>
              {gateMode ? (
                <p className={cn("mt-1 text-sm", CARD_STYLES.subText)}>
                  Tick each item when you can demo or explain it — progress saves to your account.
                </p>
              ) : null}
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
              CARD_STYLES.badge
            )}
          >
            {checkedCount}/{total}
          </span>
        </div>

        <div className={cn("mt-4 h-1.5 overflow-hidden rounded-full", CARD_STYLES.progress)}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              CARD_STYLES.progressFill
            )}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={checkedCount}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>
      </div>

      <ul className="space-y-0.5 p-2 sm:p-3">
        {items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            checked={Boolean(checkedMap[item.id])}
            onToggle={(next) => toggle(item.id, next)}
          />
        ))}
      </ul>

      {allDone ? (
        <div className="border-t border-emerald-100 bg-emerald-50/80 px-5 py-3.5">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <PartyPopper className="size-4 shrink-0" aria-hidden />
            All items complete — nice work!
          </p>
        </div>
      ) : null}
    </div>
  );
}
