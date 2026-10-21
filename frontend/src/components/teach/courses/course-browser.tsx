"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isSafeAssetUrl } from "@/shared/lib/asset-url";
import type { MentorCourseCard } from "@/shared/api/teach";

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
    {visible.length ? <div className="mt-5 grid gap-5 lg:grid-cols-2">{visible.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <div className="mt-4 rounded-2xl border border-dashed p-10 text-center"><p className="text-sm font-medium">No courses match</p><p className="mt-1 text-sm text-muted-foreground">Try a different search or status filter.</p></div>}
  </section>;
}

function CourseCard({ course }: { course: MentorCourseCard }) {
  const cover = course.coverUrl && isSafeAssetUrl(course.coverUrl)
    ? course.coverUrl
    : course.slug.includes("multi-vendor")
      ? "/showcase/multi-vendor-marketplace/freshmarket-marketplace-hd.png"
      : course.slug.includes("ticket")
        ? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
        : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";
  const attention = course.pendingReviews > 0
    ? `${course.pendingReviews} answer${course.pendingReviews === 1 ? "" : "s"} to check`
    : course.openHelpRequests > 0
      ? `${course.openHelpRequests} learner question${course.openHelpRequests === 1 ? "" : "s"}`
      : course.inactiveLearners > 0
        ? `${course.inactiveLearners} inactive learner${course.inactiveLearners === 1 ? "" : "s"}`
        : null;

  return <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-foreground/20">
    <Link href={`/courses/${course.slug}/edit`} aria-label={`Open ${course.title} curriculum`} className="relative block overflow-hidden bg-muted">
      <Image unoptimized src={cover} alt="" width={1200} height={560} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[2.3/1] w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
      <Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"} className="absolute left-4 top-4 capitalize shadow-sm">{course.status.toLowerCase()}</Badge>
    </Link>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <Link href={`/courses/${course.slug}/edit`} className="w-fit max-w-full hover:underline hover:underline-offset-2"><h3 className="line-clamp-2 text-lg font-semibold leading-6 tracking-tight">{course.title}</h3></Link>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{course.description || "Add a description in course settings."}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{course.chapterCount} chapters</span><span aria-hidden>·</span>
        <span>{course.learnerCount} learner{course.learnerCount === 1 ? "" : "s"}</span><span aria-hidden>·</span>
        <span>{course.averageProgress}% average progress</span>
      </div>
      {attention && <p className="mt-3 w-fit rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">{attention}</p>}
      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <Link href={`/courses/${course.slug}/edit`} className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>Curriculum <ArrowRight className="size-4" aria-hidden /></Link>
          <Link href={`/courses/${course.slug}/mentees`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-1.5")}><Users className="size-4" aria-hidden /> Learners</Link>
        </div>
      </div>
    </div>
  </article>;
}
