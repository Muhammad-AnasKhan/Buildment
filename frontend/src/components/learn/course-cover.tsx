import { cn } from "@/lib/utils";

/**
 * Flat Edorax covers for courses without a photo: one brand colour and a few plain shapes, no images
 * to download. They keep the same rhythm everywhere a course is listed.
 */
const GENERATED_COVERS = [
  {
    bg: "#2434E0",
    shapes: '<rect x="30" y="92" width="22" height="40" fill="#F6F7FB"/><rect x="62" y="68" width="22" height="64" fill="#F6F7FB"/><rect x="94" y="40" width="22" height="92" fill="#FFC933"/>',
  },
  {
    bg: "#0A0F2C",
    shapes: '<circle cx="80" cy="70" r="40" fill="none" stroke="#7A8BFF" stroke-width="14"/><circle cx="80" cy="70" r="14" fill="#FFC933"/>',
  },
  {
    bg: "#FFC933",
    shapes: '<rect x="36" y="36" width="52" height="52" fill="#0A0F2C"/><rect x="72" y="72" width="52" height="52" fill="#2434E0"/>',
  },
  {
    bg: "#E8EBFF",
    shapes: '<circle cx="48" cy="70" r="16" fill="#2434E0"/><circle cx="88" cy="70" r="16" fill="#0A0F2C"/><circle cx="128" cy="70" r="16" fill="#FFC933"/>',
  },
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
        <div aria-hidden className="absolute inset-0" style={{ backgroundColor: palette.bg }}>
          <svg
            viewBox="0 0 160 140"
            preserveAspectRatio="xMidYMid slice"
            className="size-full"
            dangerouslySetInnerHTML={{ __html: palette.shapes }}
          />
        </div>
      )}
    </div>
  );
}
