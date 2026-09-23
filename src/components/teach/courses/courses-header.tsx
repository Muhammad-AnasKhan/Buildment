import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCourse } from "@/server/actions/courses";

export function CoursesHeader({ courseCount, pendingReviews }: { courseCount: number; pendingReviews: number }) {
  return <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Mentor workspace</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your courses</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Monitor learner progress, handle reviews, and keep every course moving from one focused workspace.</p>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{courseCount} course{courseCount === 1 ? "" : "s"}{pendingReviews > 0 ? ` · ${pendingReviews} submissions waiting` : " · review queue clear"}</p>
    </div>
    <form id="create-course" className="flex w-full max-w-md items-center gap-2" action={async (formData) => {
      "use server";
      const title = String(formData.get("title") ?? "").trim();
      const result = await createCourse({ title });
      if (result.ok) redirect(`/courses/${result.courseSlug}/edit`);
    }}>
      <Input name="title" required minLength={3} aria-label="New course title" placeholder="New course title" className="h-9 bg-background" />
      <Button type="submit" className="h-9 gap-1.5"><Plus /> Create course</Button>
    </form>
  </header>;
}
