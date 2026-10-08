import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <img src={coverUrl} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted/40 p-4 text-center">
          <BookOpen className="size-8 text-muted-foreground/50" aria-hidden />
          <span className="line-clamp-2 max-w-[90%] text-xs font-medium text-muted-foreground">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}
