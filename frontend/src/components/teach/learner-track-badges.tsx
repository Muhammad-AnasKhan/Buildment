import { Badge } from "@/components/ui/badge";
import type { LearnerTrackSummary } from "@/shared/lib/course-tracks";

/** A learner's variant and specialisation, for courses in a family. Renders nothing otherwise. */
export function LearnerTrackBadges({ track, className }: { track: LearnerTrackSummary | null; className?: string }) {
  if (!track) return null;
  return (
    <span className={className ? `flex flex-wrap items-center gap-1.5 ${className}` : "flex flex-wrap items-center gap-1.5"}>
      <Badge variant={track.variant ? "secondary" : "outline"} title="Variant">
        {track.variant ? `${track.variant.productName} · ${track.variant.label}` : "Variant not chosen"}
      </Badge>
      {track.specialisation ? (
        <Badge variant="outline" title="Specialisation">
          {track.specialisation.label}
        </Badge>
      ) : null}
    </span>
  );
}
