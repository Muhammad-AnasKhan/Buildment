import { cn } from "@/lib/utils";

/**
 * Printed cover colors for courses without a photo. White text stays readable in
 * both themes and nothing is downloaded, which matters on slow links.
 */
const GENERATED_COVERS = [
  { from: "#193b4b", accent: "#b9d4df" },
  { from: "#4a3049", accent: "#dfc0da" },
  { from: "#234837", accent: "#b9dbbf" },
  { from: "#653c2e", accent: "#e8c7b8" },
  { from: "#343b65", accent: "#c3caec" },
  { from: "#524723", accent: "#e4d79e" },
  { from: "#623844", accent: "#ecc1cd" },
  { from: "#264c4e", accent: "#b9e2df" },
] as const;

function coverIndex(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  return hash % GENERATED_COVERS.length;
}

export function CourseCover({
  coverUrl,
  title,
  className,
  aspect = "video",
  paletteIndex,
}: {
  coverUrl: string | null | undefined;
  title: string;
  className?: string;
  aspect?: "video" | "banner" | "thumb";
  /** List position avoids hash collisions between neighboring catalog covers. */
  paletteIndex?: number;
}) {
  const aspectClass =
    aspect === "banner"
      ? "aspect-[21/9] min-h-[8rem]"
      : aspect === "thumb"
        ? "aspect-[4/3] min-h-[5rem]"
        : "aspect-video min-h-[7rem]";

  const index = paletteIndex === undefined ? coverIndex(title) : Math.abs(Math.trunc(paletteIndex)) % GENERATED_COVERS.length;
  const palette = GENERATED_COVERS[index];

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectClass,
        className
      )}
    >
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex flex-col justify-end"
          style={{ backgroundColor: palette.from }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(${45 + index * 15}deg, transparent, transparent 22px, ${palette.accent} 22px, ${palette.accent} 23px)`,
            }}
          />
          <div
            className="absolute -right-6 -top-8 size-40 rounded-full border-[24px] opacity-20"
            style={{ borderColor: palette.accent }}
          />
          {paletteIndex !== undefined ? (
            <span className="relative p-4 font-serif text-6xl leading-none text-white">
              {String(paletteIndex + 1).padStart(2, "0")}
            </span>
          ) : aspect === "thumb" ? (
            <span className="relative line-clamp-3 p-2 text-[11px] font-semibold leading-tight text-white">
              {title}
            </span>
          ) : (
            <div className={cn("relative", aspect === "banner" ? "p-6 sm:p-10" : "p-3")}>
              <span
                className={cn("block h-1 rounded-full", aspect === "banner" ? "mb-2 w-10" : "mb-1.5 w-7")}
                style={{ backgroundColor: palette.accent }}
              />
              <span
                className={cn(
                  "block max-w-[22ch] font-semibold leading-tight tracking-tight text-white text-balance",
                  aspect === "banner" ? "text-2xl sm:text-4xl" : "line-clamp-2 text-[15px]"
                )}
              >
                {title}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
