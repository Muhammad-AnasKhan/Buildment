import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Info, Lightbulb, TriangleAlert, CircleCheck } from "lucide-react";

const CALLOUT_STYLES = {
  info: {
    border: "border-border",
    bg: "bg-secondary",
    iconBg: "bg-card",
    iconColor: "text-primary",
    label: "Note",
    Icon: Info,
  },
  tip: {
    border: "border-ok",
    bg: "bg-ok-soft",
    iconBg: "bg-card",
    iconColor: "text-ok",
    label: "Tip",
    Icon: Lightbulb,
  },
  warning: {
    border: "border-brand-yellow",
    bg: "bg-brand-yellow/15",
    iconBg: "bg-brand-yellow",
    iconColor: "text-[#0A0F2C]",
    label: "Warning",
    Icon: TriangleAlert,
  },
  success: {
    border: "border-ok",
    bg: "bg-ok-soft",
    iconBg: "bg-card",
    iconColor: "text-ok",
    label: "Success",
    Icon: CircleCheck,
  },
} as const;

type CalloutProps = {
  type?: keyof typeof CALLOUT_STYLES;
  title?: string;
  content?: string;
  children?: ReactNode;
};

export function Callout({ type = "info", title, content, children }: CalloutProps) {
  const style = (type && CALLOUT_STYLES[type]) ? CALLOUT_STYLES[type] : CALLOUT_STYLES.info;
  const Icon = style.Icon;
  const heading = title ?? style.label;

  return (
    <aside
      className={cn(
        "not-prose my-8 overflow-hidden rounded-lg border-2",
        style.border,
        style.bg
      )}
      role="note"
      aria-label={heading}
    >
      <div className="flex gap-4 p-5 sm:p-6">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            style.iconBg
          )}
        >
          <Icon className={cn("size-5", style.iconColor)} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-foreground">{heading}</p>
          <div className="mt-2 text-sm leading-relaxed text-foreground [&_p]:mt-0 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground">
            {children ?? content}
          </div>
        </div>
      </div>
    </aside>
  );
}
