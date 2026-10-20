import { cn } from "@/lib/utils";

/**
 * Deep two-stop gradients for courses without a cover photo. White text stays readable on
 * every pair in light and dark mode, and nothing is downloaded, which matters on slow links.
 */
const GENERATED_COVERS = [
  { from: "#1e3a5f", to: "#2f6f8f", accent: "#7dd3fc" },
  { from: "#3b2a5c", to: "#6b3f8f", accent: "#d8b4fe" },
  { from: "#1f4d3a", to: "#2f7a5a", accent: "#86efac" },
  { from: "#5c2a2a", to: "#8f4a3a", accent: "#fdba74" },
  { from: "#2a3a5c", to: "#3f5f9f", accent: "#a5b4fc" },
  { from: "#4a3a1f", to: "#7a5f2f", accent: "#fde68a" },
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
}: {
  coverUrl: string | null | undefined;
  title: string;
  className?: string;
  aspect?: "video" | "banner" | "thumb";
}) {
  const aspectClass =
    aspect === "banner"
      ? "aspect-[21/9] min-h-[8rem]"
      : aspect === "thumb"
        ? "aspect-[4/3] min-h-[5rem]"
        : "aspect-video min-h-[7rem]";

  const palette = GENERATED_COVERS[coverIndex(title)];

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
        <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex flex-col justify-end"
          style={{ backgroundImage: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
        >
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
              backgroundSize: aspect === "thumb" ? "10px 10px" : "18px 18px",
            }}
          />
          <div
            className="absolute -right-[12%] -top-[30%] aspect-square w-[55%] rounded-full opacity-25 blur-2xl"
            style={{ backgroundColor: palette.accent }}
          />
          {aspect === "thumb" ? (
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
