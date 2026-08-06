import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Info, Lightbulb, TriangleAlert, CircleCheck } from "lucide-react";

const CALLOUT_STYLES = {
  info: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    Icon: Info,
  },
  tip: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    Icon: Lightbulb,
  },
  warning: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    Icon: TriangleAlert,
  },
  success: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
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

  return (
    <div className={cn("not-prose my-6 flex gap-3 rounded-xl border p-4", style.border, style.bg)}>
      <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", style.iconBg)}>
        <Icon className={cn("size-4", style.iconColor)} />
      </div>
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-neutral-700">
        {title ? (
          <>
            <p className="font-semibold text-neutral-900">{title}</p>
            <div className="mt-1">{children}</div>
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
