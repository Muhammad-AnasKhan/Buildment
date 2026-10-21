import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { COURSE_FAMILIES, type LearnerTrackSummary } from "@/shared/lib/course-tracks";
import { cn } from "@/lib/utils";

function accentFor(variantSlug: string): string | undefined {
  for (const family of COURSE_FAMILIES) {
    const variant = family.variants.find((item) => item.slug === variantSlug);
    if (variant) return variant.theme.accentLight;
  }
  return undefined;
}

/** A learner's variant and specialisation, for courses in a family. Renders nothing otherwise. */
export function LearnerTrackBadges({ track, className }: { track: LearnerTrackSummary | null; className?: string }) {
  if (!track) return null;
  return (
    <span className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {track.variant ? (
        <Badge variant="secondary" title={`Variant: ${track.variant.label}`} className="gap-1.5">
          <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: accentFor(track.variant.slug) }} />
          {track.variant.productName} · {track.variant.label}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Variant not chosen
        </Badge>
      )}
      {track.specialisation ? (
        <Badge variant="outline" title="Specialisation" className="gap-1">
          <GraduationCap className="size-3" aria-hidden />
          {track.specialisation.label}
        </Badge>
      ) : null}
    </span>
  );
}
