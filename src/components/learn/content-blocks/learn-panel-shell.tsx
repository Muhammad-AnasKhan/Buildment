import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EYEBROW_ICONS, type ContentBlockEyebrow } from "./types";

type LearnPanelShellProps = {
  eyebrow: ContentBlockEyebrow;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  "aria-label"?: string;
};

export function LearnPanelShell({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  contentClassName,
  "aria-label": ariaLabel,
}: LearnPanelShellProps) {
  const Icon = EYEBROW_ICONS[eyebrow];

  return (
    <section
      className={cn("not-prose my-10", className)}
      aria-label={ariaLabel ?? title ?? eyebrow}
      data-learn-panel={eyebrow.toLowerCase().replace(/\s+/g, "-")}
    >
      {(title || subtitle) && (
        <header className="mb-5">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
          </div>
          {title ? (
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border/90 bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)]",
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
