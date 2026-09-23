import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-7", text: "text-[15px]", gap: "gap-2" },
  md: { box: "size-8", text: "text-base", gap: "gap-2.5" },
  lg: { box: "size-10", text: "text-xl", gap: "gap-3" },
} as const;

/** A lowercase “b” assembled from course blocks and a rising learning path. */
export function Logo({
  size = "md",
  withWordmark = true,
  className,
}: {
  size?: keyof typeof SIZES;
  withWordmark?: boolean;
  className?: string;
}) {
  const styles = SIZES[size];

  return (
    <span className={cn("inline-flex items-center", styles.gap, className)}>
      <svg
        viewBox="0 0 40 40"
        role="img"
        aria-label={withWordmark ? undefined : "buildment"}
        className={cn("shrink-0 text-foreground", styles.box)}
      >
        <rect x="3" y="3" width="34" height="34" rx="10" fill="currentColor" />
        <path
          d="M11 10.5h5v7h7.2a6.8 6.8 0 0 1 0 13.6H11V10.5Zm5 11.5v4.6h6.5a2.3 2.3 0 1 0 0-4.6H16Z"
          fill="var(--background)"
        />
        <rect x="18" y="10.5" width="10.5" height="4" rx="2" fill="var(--background)" />
      </svg>
      {withWordmark ? (
        <span className={cn("font-semibold tracking-[-0.035em] text-foreground", styles.text)}>
          buildment
        </span>
      ) : null}
    </span>
  );
}
