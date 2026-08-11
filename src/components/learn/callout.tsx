import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Info, Lightbulb, TriangleAlert, CircleCheck } from "lucide-react";

const CALLOUT_STYLES = {
  info: {
    border: "border-blue-200/90",
    bg: "bg-gradient-to-br from-blue-50 to-white",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    label: "Note",
    Icon: Info,
  },
  tip: {
    border: "border-emerald-200/90",
    bg: "bg-gradient-to-br from-emerald-50 to-white",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    label: "Tip",
    Icon: Lightbulb,
  },
  warning: {
    border: "border-amber-200/90",
    bg: "bg-gradient-to-br from-amber-50 to-white",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    label: "Warning",
    Icon: TriangleAlert,
  },
  success: {
    border: "border-emerald-200/90",
    bg: "bg-gradient-to-br from-emerald-50 to-white",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    label: "Success",
    Icon: CircleCheck,
  },
} as const;

type CalloutProps = {
  type?: keyof typeof CALLOUT_STYLES;
  title?: string;
  children: ReactNode;
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const style = CALLOUT_STYLES[type];
  const Icon = style.Icon;
  const heading = title ?? style.label;

  return (
    <aside
      className={cn(
        "not-prose my-8 overflow-hidden rounded-2xl border shadow-sm",
        style.border,
        style.bg
      )}
      role="note"
      aria-label={heading}
    >
      <div className="flex gap-4 p-5 sm:p-6">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            style.iconBg
          )}
        >
          <Icon className={cn("size-5", style.iconColor)} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-neutral-950">{heading}</p>
          <div className="mt-2 text-sm leading-relaxed text-neutral-700 [&_p]:mt-0 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-neutral-900">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
