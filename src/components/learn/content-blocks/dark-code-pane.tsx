import { cn } from "@/lib/utils";

export function DarkCodePane({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto bg-[#0d1117] font-mono text-[12px] leading-[1.65] text-[#e6edf3] sm:text-[13px]",
        className
      )}
    >
      {children}
    </div>
  );
}
