import { BookOpen, CircleHelp, FileText, MessageSquareText, Send, Users } from "lucide-react";
import type { MentorCoursesView } from "@/server/mentor-dashboard/types";

export function CoursesSummary({ summary }: { summary: MentorCoursesView["summary"] }) {
  const metrics = [
    { label: "Total courses", value: summary.totalCourses, icon: BookOpen },
    { label: "Published", value: summary.publishedCourses, icon: Send },
    { label: "Drafts", value: summary.draftCourses, icon: FileText },
    { label: "Learners", value: summary.totalLearners, icon: Users },
    { label: "Pending reviews", value: summary.pendingReviews, icon: MessageSquareText },
    { label: "Open help", value: summary.openHelpRequests, icon: CircleHelp },
  ];
  return <section aria-label="Course workload summary" className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-card sm:grid-cols-3 lg:grid-cols-6">
    {metrics.map(({ label, value, icon: Icon }) => <div key={label} className="border-b border-r p-4 last:border-r-0 sm:[&:nth-child(n+4)]:border-b-0 lg:border-b-0">
      <div className="flex items-center gap-2 text-muted-foreground"><Icon className="size-3.5" /><span className="text-[11px] font-medium">{label}</span></div>
      <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight">{value}</p>
    </div>)}
  </section>;
}
