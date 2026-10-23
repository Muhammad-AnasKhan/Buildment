import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  headingId?: string;
  as?: "h1" | "h2";
  /** Heading on the left, description on the right (stacks on mobile). */
  split?: boolean;
  className?: string;
};

export function SectionHeader({
  label,
  title,
  description,
  headingId,
  as: Heading = "h2",
  split = false,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        split &&
          "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Heading
          id={headingId}
          className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
        >
          {title}
        </Heading>
      </div>
      {description ? (
        <p
          className={cn(
            "text-sm leading-6 text-muted-foreground sm:text-base",
            split ? "max-w-[44ch]" : "mt-2 max-w-2xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
