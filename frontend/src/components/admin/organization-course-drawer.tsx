"use client";

import { Fragment, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Check, ListFilter, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/app-toast";
import { bulkUpsertOrganizationCourseAllocationsAction } from "@/server/actions/admin/organizations";
import { cn } from "@/lib/utils";

type Course = {
  id: string;
  title: string;
  slug: string;
  allocated: boolean;
  pendingRequest: boolean;
  maxEnrollments: number;
  expiresAt: string;
};

type Draft = { maxEnrollments: string; expiresAt: string };
const initialState = { ok: false, message: "" };

export function OrganizationCourseDrawer({ organizationId, courses }: { organizationId: string; courses: Course[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(courses.filter((course) => course.allocated).map((course) => course.id)));
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(courses.map((course) => [course.id, { maxEnrollments: String(course.maxEnrollments), expiresAt: course.expiresAt }]))
  );
  const [state, formAction] = useActionState(bulkUpsertOrganizationCourseAllocationsAction, initialState);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (state.message) {
      toast(state.message, state.ok ? "success" : "error");
    }
  }, [state]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? courses.filter((course) => course.title.toLowerCase().includes(query) || course.slug.toLowerCase().includes(query)) : courses;
  }, [courses, search]);
  const assignedCount = courses.filter((course) => selected.has(course.id)).length;
  const changedCount = courses.filter((course) => selected.has(course.id) !== course.allocated).length;

  function toggle(courseId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  }

  function updateDraft(courseId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({ ...current, [courseId]: { ...current[courseId], ...patch } }));
  }

  function selectAllVisible() {
    setSelected((current) => new Set([...current, ...filteredCourses.map((course) => course.id)]));
  }

  function clearVisible() {
    setSelected((current) => {
      const next = new Set(current);
      filteredCourses.forEach((course) => next.delete(course.id));
      return next;
    });
  }

  function openManager() {
    setSelected(new Set(courses.filter((course) => course.allocated).map((course) => course.id)));
    setDrafts(Object.fromEntries(courses.map((course) => [course.id, { maxEnrollments: String(course.maxEnrollments), expiresAt: course.expiresAt }])));
    setSearch("");
    setOpen(true);
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={openManager}>
        <ListFilter className="size-4" aria-hidden />
        Manage courses
      </Button>

      <dialog ref={dialogRef} onClose={() => setOpen(false)} aria-labelledby="course-access-title" className="fixed inset-0 z-[70] m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-background/70 open:flex open:justify-end">
        <div className="flex h-full w-full max-w-2xl flex-col border-l border-border bg-background text-foreground shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-border bg-card px-5 py-5 sm:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Organization access</p>
              <h2 id="course-access-title" className="mt-1 text-xl font-semibold tracking-tight">Manage courses</h2>
              <p className="mt-1 text-sm text-muted-foreground">Check the courses this organization can access. Uncheck a course to remove it.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Close course management"><X className="size-5" aria-hidden /></button>
          </div>

          <form action={formAction} className="flex min-h-0 flex-1 flex-col">
            <input type="hidden" name="organizationId" value={organizationId} />
            {courses.map((course) => {
              if (selected.has(course.id)) {
                const draft = drafts[course.id];
                return <Fragment key={course.id}><input type="hidden" name="courseIds" value={course.id} /><input type="hidden" name={`maxEnrollments_${course.id}`} value={draft.maxEnrollments} /><input type="hidden" name={`expiresAt_${course.id}`} value={draft.expiresAt} /></Fragment>;
              }
              return course.allocated ? <input key={course.id} type="hidden" name="removeCourseIds" value={course.id} /> : null;
            })}

            <div className="border-b border-border bg-card px-5 py-4 sm:px-7">
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses by title or slug…" className="h-10 pl-9" /></div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{assignedCount} of {courses.length} courses assigned</span><span>{changedCount ? `${changedCount} unsaved change${changedCount === 1 ? "" : "s"}` : "No unsaved changes"}</span></div>
              <div className="mt-3 flex gap-2"><Button type="button" size="sm" variant="outline" onClick={selectAllVisible}>Select visible</Button><Button type="button" size="sm" variant="ghost" onClick={clearVisible}>Clear visible</Button></div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                {filteredCourses.length === 0 ? <p className="px-4 py-12 text-center text-sm text-muted-foreground">No courses match your search.</p> : <ul className="divide-y divide-border">{filteredCourses.map((course) => {
                  const checked = selected.has(course.id);
                  const draft = drafts[course.id];
                  return <li key={course.id} className={cn("p-4 transition-colors", checked && "bg-primary/[0.035]")}>
                    <div className="flex items-start gap-3">
                      <button type="button" onClick={() => toggle(course.id)} className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded border transition-colors", checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:border-primary")} aria-label={`${checked ? "Unassign" : "Assign"} ${course.title}`}>{checked ? <Check className="size-3.5" aria-hidden /> : null}</button>
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium leading-snug">{course.title}</p>{checked ? <Badge variant="secondary" className="text-[10px]">Assigned</Badge> : <Badge variant="outline" className="text-[10px]">Available</Badge>}{course.pendingRequest && !checked ? <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-800 dark:text-amber-200">Requested</Badge> : null}</div><p className="mt-1 font-mono text-xs text-muted-foreground">{course.slug}</p>{checked ? <div className="mt-3 grid gap-2 sm:grid-cols-2"><label className="text-xs text-muted-foreground">Max enrollments<Input type="number" min={1} value={draft.maxEnrollments} onChange={(event) => updateDraft(course.id, { maxEnrollments: event.target.value })} className="mt-1 h-9" /></label><label className="text-xs text-muted-foreground">Expires (optional)<Input type="date" value={draft.expiresAt} onChange={(event) => updateDraft(course.id, { expiresAt: event.target.value })} className="mt-1 h-9" /></label></div> : null}</div>
                    </div>
                  </li>;
                })}</ul>}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-5 py-4 sm:px-7"><p className="text-xs text-muted-foreground">Changes apply immediately after saving.</p><div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={changedCount === 0} loadingLabel="Saving…">Save changes</Button></div></div>
          </form>
        </div>
      </dialog>
    </>
  );
}
