"use client";

export function AutoSubmitSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={className}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    />
  );
}
