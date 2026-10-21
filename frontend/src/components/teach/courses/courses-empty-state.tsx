import { BookOpen } from "lucide-react";

export function CoursesEmptyState() {
  return <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-16 text-center">
    <span className="grid size-12 place-items-center rounded-2xl border bg-background"><BookOpen className="size-5 text-muted-foreground" /></span>
    <h2 className="mt-4 text-base font-semibold">Create your first course</h2>
    <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">Choose Create course above to start building your first draft.</p>
  </div>;
}
