import { BookOpenCheck, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCourseSettings } from "@/server/actions/modules";
import type { CourseBuilderCourse } from "./types";

export function CourseSettings({ course }: { course: CourseBuilderCourse }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <details className="group rounded-xl border bg-card" open>
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <Settings2 className="size-4 text-muted-foreground" />
          Course settings
          <span className="ml-auto text-xs text-muted-foreground group-open:hidden">Open</span>
          <span className="ml-auto hidden text-xs text-muted-foreground group-open:inline">Close</span>
        </summary>
        <form
          className="space-y-4 border-t p-4"
          action={async (formData) => {
            "use server";
            await updateCourseSettings({
              courseId: course.id,
              title: String(formData.get("title") ?? ""),
              description: String(formData.get("description") ?? ""),
              projectGoal: String(formData.get("projectGoal") ?? ""),
              difficulty: String(formData.get("difficulty") ?? ""),
              estimatedHours: String(formData.get("estimatedHours") ?? ""),
              sequential: formData.get("sequential") === "on",
            });
          }}
        >
          <Field label="Course title" htmlFor="course-title">
            <Input id="course-title" name="title" defaultValue={course.title} minLength={3} maxLength={120} required />
          </Field>
          <Field label="Short description" htmlFor="course-description">
            <Textarea
              id="course-description"
              name="description"
              defaultValue={course.description ?? ""}
              maxLength={500}
              rows={3}
              placeholder="What will learners build and understand?"
            />
          </Field>
          <Field label="Project goal" htmlFor="course-goal">
            <Input
              id="course-goal"
              name="projectGoal"
              defaultValue={course.projectGoal ?? ""}
              maxLength={240}
              placeholder="Ship a real-time multiplayer game"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Difficulty" htmlFor="course-difficulty">
              <select
                id="course-difficulty"
                name="difficulty"
                defaultValue={course.difficulty ?? ""}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Not set</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </Field>
            <Field label="Hours" htmlFor="course-hours">
              <Input
                id="course-hours"
                name="estimatedHours"
                type="number"
                min={1}
                max={1000}
                defaultValue={course.estimatedHours ?? ""}
                placeholder="12"
              />
            </Field>
          </div>
          <label className="flex items-start gap-3 rounded-lg border bg-muted/35 p-3">
            <input
              type="checkbox"
              name="sequential"
              defaultChecked={course.sequential}
              className="mt-0.5 size-4 rounded border-input accent-primary"
            />
            <span>
              <span className="block text-sm font-medium">Sequential learning</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                Require learners to complete chapters in order.
              </span>
            </span>
          </label>
          <Button type="submit" className="w-full">Save settings</Button>
        </form>
      </details>

      <div className="rounded-xl border bg-muted/30 p-4">
        <BookOpenCheck className="size-5 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Authoring workflow</p>
        <ol className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
          <li>1. Organize modules and chapters.</li>
          <li>2. Open a chapter to add lessons and activities.</li>
          <li>3. Publish each chapter, then publish the course.</li>
        </ol>
      </div>
    </aside>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
