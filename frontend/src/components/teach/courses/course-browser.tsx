"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, CircleHelp, Clock3, MessageSquareText, Pencil, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MentorCourseCard } from "@/server/mentor-dashboard/types";

type StatusFilter = "all" | "PUBLISHED" | "DRAFT" | "attention";

export function CourseBrowser({ courses }: { courses: MentorCourseCard[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesQuery = !needle || course.title.toLowerCase().includes(needle) || course.description?.toLowerCase().includes(needle);
      const hasAttention = course.pendingReviews + course.openHelpRequests + course.inactiveLearners > 0;
      const matchesStatus = status === "all" || (status === "attention" ? hasAttention : course.status === status);
      return matchesQuery && matchesStatus;
    });
  }, [courses, query, status]);

  return <section aria-labelledby="course-list-title">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 id="course-list-title" className="text-lg font-semibold">Course portfolio</h2><p className="text-sm text-muted-foreground">Choose a course to manage its curriculum or cohort.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative"><span className="sr-only">Search courses</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" className="h-9 w-full pl-9 sm:w-56" /></label>
        <label><span className="sr-only">Filter course status</span><select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-40"><option value="all">All courses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Drafts</option><option value="attention">Needs attention</option></select></label>
      </div>
    </div>
    {visible.length ? <div className="mt-4 grid gap-4 lg:grid-cols-2">{visible.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <div className="mt-4 rounded-2xl border border-dashed p-10 text-center"><p className="text-sm font-medium">No courses match</p><p className="mt-1 text-sm text-muted-foreground">Try a different search or status filter.</p></div>}
  </section>;
}

function CourseCard({ course }: { course: MentorCourseCard }) {
  const attention = course.pendingReviews + course.openHelpRequests + course.inactiveLearners;
  return <article className="flex min-w-0 flex-col rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/15">
    <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-sm font-semibold">{course.title.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{course.title}</h3><Badge variant={course.status === "PUBLISHED" ? "secondary" : "outline"} className="capitalize">{course.status.toLowerCase()}</Badge></div><p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{course.description || "No course description yet."}</p></div></div>
    <div className="mt-4 grid grid-cols-3 gap-3 border-y py-3 text-xs"><Metric icon={Users} value={String(course.learnerCount)} label="learners" /><Metric icon={BookOpen} value={`${course.averageProgress}%`} label="avg progress" /><Metric icon={MessageSquareText} value={String(course.pendingReviews)} label="to review" /></div>
    {attention > 0 ? <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">{course.pendingReviews > 0 ? <span className="inline-flex items-center gap-1.5"><MessageSquareText className="size-3.5" />{course.pendingReviews} waiting</span> : null}{course.openHelpRequests > 0 ? <span className="inline-flex items-center gap-1.5"><CircleHelp className="size-3.5" />{course.openHelpRequests} open help</span> : null}{course.inactiveLearners > 0 ? <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{course.inactiveLearners} inactive 7+ days</span> : null}</div> : <p className="mt-3 text-xs text-muted-foreground">No current mentor actions.</p>}
    <div className="mt-auto flex flex-wrap items-center gap-2 pt-5"><Link href={`/courses/${course.slug}/mentees`} className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>Open course <ArrowRight /></Link><Link href={`/courses/${course.slug}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}><Pencil /> Edit</Link><Link href={`/courses/${course.slug}/reports`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}><BarChart3 /> Reports</Link><span className="ml-auto text-[11px] text-muted-foreground">Updated {new Date(course.updatedAt).toLocaleDateString()}</span></div>
  </article>;
}

function Metric({ icon: Icon, value, label }: { icon: typeof Users; value: string; label: string }) { return <div className="min-w-0"><span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5" />{label}</span><span className="mt-1 block text-sm font-semibold tabular-nums text-foreground">{value}</span></div>; }
