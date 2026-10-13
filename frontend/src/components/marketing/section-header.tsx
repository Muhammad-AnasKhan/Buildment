type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  headingId?: string;
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeader({
  label,
  title,
  description,
  headingId,
  as: Heading = "h2",
  className,
}: SectionHeaderProps) {
  return (
    <header className={className}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <Heading id={headingId} className="mt-1 text-3xl font-semibold tracking-tight">
        {title}
      </Heading>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
