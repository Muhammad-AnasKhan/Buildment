import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: 22, text: "text-sm" },
  md: { box: 26, text: "text-[15px]" },
  lg: { box: 34, text: "text-lg" },
} as const;

export function Logo({
  size = "md",
  withWordmark = true,
  className,
}: {
  size?: keyof typeof SIZES;
  withWordmark?: boolean;
  className?: string;
}) {
  const { box, text } = SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="buildment"
        width={box}
        height={box}
        className="shrink-0 rounded-[7px]"
        priority
      />
      {withWordmark ? (
        <span className={cn("font-semibold tracking-tight text-neutral-950", text)}>
          buildment
        </span>
      ) : null}
    </span>
  );
}
