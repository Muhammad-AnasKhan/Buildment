import { SpecialisationPanel as SharedPanel } from "@buildment/learning-ui/components/learn/course-track-panels";
import { chooseCourseSpecialisationAction } from "@/server/actions/course-track";
import type { CourseTrack } from "@/shared/lib/course-tracks";
export { VariantBanner, VariantDot, VariantChannels, VariantDetails, channelIcon } from "@buildment/learning-ui/components/learn/course-track-panels";
export function SpecialisationPanel(props: { courseSlug: string; track: CourseTrack }) {
  return <SharedPanel {...props} onChoose={chooseCourseSpecialisationAction} />;
}
