"use client";

import { Fragment, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bulkUpsertOrganizationCourseAllocationsAction } from "@/server/actions/admin/organizations";

const PAGE_SIZE = 25;

export type BulkAllocationCourse = {
  id: string;
  title: string;
  slug: string;
  allocated: boolean;
  pendingRequest: boolean;
  maxEnrollments: number;
  expiresAt: string;
};

type CourseDraft = {
  maxEnrollments: string;
  expiresAt: string;
};

function defaultDraft(course: BulkAllocationCourse): CourseDraft {
  return {
    maxEnrollments: String(course.maxEnrollments),
    expiresAt: course.expiresAt,
  };
}

function matchesSearch(course: BulkAllocationCourse, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return course.title.toLowerCase().includes(q) || course.slug.toLowerCase().includes(q);
}

function CourseAllocationBadges({
  course,
  intent,
}: {
  course: BulkAllocationCourse;
  intent: "add" | "update";
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {course.allocated ? (
        <Badge variant="secondary" className="text-[10px]">
          Added to catalog
        </Badge>
      ) : intent === "add" ? (
        <Badge variant="outline" className="text-[10px]">
          Not in catalog
        </Badge>
      ) : null}
      {!course.allocated && course.pendingRequest && intent === "add" ? (
        <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-800 dark:text-amber-200">
          Requested
        </Badge>
      ) : null}
    </div>
  );
}

export function BulkCourseAllocationForm({
  organizationId,
  courses,
  intent = "add",
  emptyMessage,
}: {
  organizationId: string;
  courses: BulkAllocationCourse[];
  /** add = courses not yet in org catalog; update = courses already allocated */
  intent?: "add" | "update";
  emptyMessage?: string;
}) {
  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [drafts, setDrafts] = useState<Record<string, CourseDraft>>(() => {
    const initial: Record<string, CourseDraft> = {};
    for (const course of courses) initial[course.id] = defaultDraft(course);
    return initial;
  });

  const filteredCourses = useMemo(
    () => courses.filter((course) => matchesSearch(course, search.trim())),
    [courses, search]
  );

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageCourses = filteredCourses.slice(pageStart, pageStart + PAGE_SIZE);

  function ensureDraft(course: BulkAllocationCourse) {
    setDrafts((prev) => (prev[course.id] ? prev : { ...prev, [course.id]: defaultDraft(course) }));
  }

  function isSelectable(course: BulkAllocationCourse): boolean {
    return intent === "update" ? course.allocated : !course.allocated;
  }

  function toggleCourse(course: BulkAllocationCourse, checked: boolean) {
    if (!isSelectable(course)) return;
    if (checked) ensureDraft(course);
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(course.id);
      else next.delete(course.id);
      return next;
    });
  }

  function updateDraft(courseId: string, patch: Partial<CourseDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], ...patch },
    }));
  }

  function selectCourses(ids: string[]) {
    const eligible = ids.filter((id) => {
      const course = courseById.get(id);
      return course && isSelectable(course);
    });
    setDrafts((prev) => {
      const next = { ...prev };
      for (const id of eligible) {
        const course = courseById.get(id);
        if (course && !next[id]) next[id] = defaultDraft(course);
      }
      return next;
    });
    setSelected((prev) => new Set([...prev, ...eligible]));
  }

  function selectAllFiltered() {
    selectCourses(filteredCourses.filter((course) => isSelectable(course)).map((course) => course.id));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  if (courses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyMessage ??
          (intent === "add"
            ? "Every published course is already in this organization's catalog."
            : "No courses in this organization's catalog yet.")}
      </p>
    );
  }

  const largeCatalog = courses.length > PAGE_SIZE;

  return (
    <form action={bulkUpsertOrganizationCourseAllocationsAction} className="space-y-4">
      <input type="hidden" name="organizationId" value={organizationId} />

      {Array.from(selected).map((courseId) => {
        const course = courseById.get(courseId);
        if (!course) return null;
        const draft = drafts[courseId] ?? defaultDraft(course);
        return (
          <Fragment key={courseId}>
            <input type="hidden" name="courseIds" value={courseId} />
            <input type="hidden" name={`maxEnrollments_${courseId}`} value={draft.maxEnrollments} />
            <input type="hidden" name={`expiresAt_${courseId}`} value={draft.expiresAt} />
          </Fragment>
        );
      })}

      {largeCatalog ? (
        <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          This catalog has {courses.length.toLocaleString()} published courses. Search to narrow the list — only{" "}
          {PAGE_SIZE} rows render per page, but selections and per-course caps persist across pages until you save.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor={`catalog-search-${intent}`} className="text-xs font-medium text-muted-foreground">
            Search {intent === "add" ? "courses to add" : "catalog courses"}
          </label>
          <Input
            id={`catalog-search-${intent}`}
            type="search"
            placeholder="Title or slug…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9"
          />
        </div>
        <p className="text-xs text-muted-foreground sm:pb-2">
          {filteredCourses.length.toLocaleString()} match · {selected.size} selected
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={selectAllFiltered}>
          Select all matching
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
          Clear selection
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="hidden grid-cols-[auto_minmax(0,1fr)_7rem_9.5rem] gap-3 border-b bg-muted/40 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
          <span aria-hidden className="w-4" />
          <span>Course</span>
          <span className="text-right">Max</span>
          <span>Expires</span>
        </div>

        {pageCourses.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">No courses match your search.</p>
        ) : (
          <ul className="divide-y">
            {pageCourses.map((course) => {
              const selectable = isSelectable(course);
              const checked = selectable && selected.has(course.id);
              const draft = drafts[course.id] ?? defaultDraft(course);
              const maxId = `max-${course.id}`;
              const expId = `exp-${course.id}`;
              return (
                <li
                  key={course.id}
                  className={`grid gap-3 px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_7rem_9.5rem] sm:items-center ${
                    checked ? "bg-muted/25" : "bg-background"
                  } ${!selectable ? "opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!selectable}
                    onChange={(event) => toggleCourse(course, event.target.checked)}
                    className="size-4 shrink-0 rounded border-input disabled:cursor-not-allowed"
                    aria-label={`Select ${course.title}`}
                  />
                  <div className="min-w-0 text-sm">
                    <p className="font-medium leading-snug">{course.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">{course.slug}</p>
                    <CourseAllocationBadges course={course} intent={intent} />
                  </div>
                  <div className="space-y-1 sm:text-right">
                    <label className="text-[10px] font-medium text-muted-foreground sm:sr-only" htmlFor={maxId}>
                      Max enrollments
                    </label>
                    <Input
                      id={maxId}
                      type="number"
                      min={1}
                      value={draft.maxEnrollments}
                      required={checked}
                      disabled={!checked}
                      onChange={(event) => updateDraft(course.id, { maxEnrollments: event.target.value })}
                      className="h-9 tabular-nums sm:ml-auto sm:w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground sm:sr-only" htmlFor={expId}>
                      Expires
                    </label>
                    <Input
                      id={expId}
                      type="date"
                      value={draft.expiresAt}
                      disabled={!checked}
                      onChange={(event) => updateDraft(course.id, { expiresAt: event.target.value })}
                      className="h-9 sm:w-full"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {filteredCourses.length > PAGE_SIZE ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredCourses.length)} of{" "}
              {filteredCourses.length.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-2 text-xs tabular-nums text-muted-foreground">
                Page {safePage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isAllowed" defaultChecked className="size-4 rounded border-input" />
        Allowed for new integration enrollments (all selected courses)
      </label>

      <Button type="submit" disabled={selected.size === 0}>
        {intent === "add"
          ? `Add ${selected.size > 0 ? selected.size.toLocaleString() : ""} course${selected.size === 1 ? "" : "s"} to catalog`
          : `Save changes for ${selected.size > 0 ? selected.size.toLocaleString() : ""} course${selected.size === 1 ? "" : "s"}`}
      </Button>
    </form>
  );
}
