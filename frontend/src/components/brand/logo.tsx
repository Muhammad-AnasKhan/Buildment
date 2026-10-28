import { cn } from "@/lib/utils";
import { Wordmark, XMark } from "@/components/brand/wordmark";

const SIZES = {
  sm: { height: 22, mark: 24 },
  md: { height: 28, mark: 30 },
  lg: { height: 38, mark: 40 },
} as const;

/**
 * The Edorax logo for the app. It follows the theme (ink or paper word, cobalt or light cobalt
 * rising stroke); with `withWordmark` off only the x is drawn. The artwork lives in wordmark.tsx.
 */
export function Logo({
  size = "md",
  withWordmark = true,
  className,
}: {
  size?: keyof typeof SIZES;
  withWordmark?: boolean;
  className?: string;
}) {
  const { height, mark } = SIZES[size];
  const style = cn("shrink-0 text-foreground", className);
  return withWordmark ? <Wordmark tone="auto" height={height} className={style} /> : <XMark size={mark} className={style} />;
}
