"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteCourse, restoreCourseToDraft, unpublishCourse } from "@/server/actions/courses";
import type { CourseBuilderCourse } from "@/shared/api/teach";

type Mode = "archive" | "delete" | null;

export function CourseManagementMenu({ course, chapterCount }: { course: Pick<CourseBuilderCourse, "id" | "title" | "status" | "enrollmentCount">; chapterCount: number }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [confirmedEnrollments, setConfirmedEnrollments] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mode && !dialog.open) dialog.showModal();
    if (!mode && dialog.open) dialog.close();
  }, [mode]);

  function close() {
    if (pending) return;
    setMode(null);
    setError(null);
    setConfirmedEnrollments(false);
    setConfirmationText("");
  }

  async function restore() {
    setPending(true);
    setError(null);
    try {
      const result = await restoreCourseToDraft({ courseId: course.id });
      if (!result.ok) setError(result.errors.join(" "));
      else router.refresh();
    } catch {
      setError("Could not move the course to draft. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function confirm() {
    if (!mode || pending) return;
    setPending(true);
    setError(null);
    try {
      if (mode === "archive") {
        const result = await unpublishCourse({ courseId: course.id, confirmedWithEnrollments: confirmedEnrollments });
        if (!result.ok) {
          setError(result.errors.join(" "));
          return;
        }
        closeAfterSuccess();
        router.refresh();
      } else {
        const result = await deleteCourse({ courseId: course.id, confirmedWithEnrollments: confirmedEnrollments });
        if (!result.ok) {
          setError(result.errors.join(" "));
          return;
        }
        closeAfterSuccess();
        router.push("/courses");
      }
    } catch {
      setError("Could not update the course. Please try again.");
    } finally {
      setPending(false);
    }
  }

  function closeAfterSuccess() {
    setMode(null);
    setConfirmedEnrollments(false);
    setConfirmationText("");
  }

  const archiveLabel = course.enrollmentCount > 0 ? "Archive course" : "Unpublish to draft";
  const canConfirm = mode === "delete"
    ? confirmationText === "DELETE" && (course.enrollmentCount === 0 || confirmedEnrollments)
    : mode === "archive" && (course.enrollmentCount === 0 || confirmedEnrollments);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {course.status === "PUBLISHED" && <Button type="button" size="lg" variant="outline" onClick={() => setMode("archive")} disabled={pending}><Archive className="size-4" aria-hidden />{archiveLabel}</Button>}
        {course.status === "ARCHIVED" && <Button type="button" size="lg" variant="outline" onClick={() => void restore()} disabled={pending} loading={pending}><RotateCcw className="size-4" aria-hidden />Move to draft</Button>}
        <Button type="button" size="lg" variant="destructive" onClick={() => setMode("delete")} disabled={pending}><Trash2 className="size-4" aria-hidden />Delete course</Button>
        {error && !mode && <p role="alert" className="w-full text-xs text-destructive">{error}</p>}
      </div>

      <dialog ref={dialogRef} onClose={close} onCancel={(event) => { if (pending) event.preventDefault(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }} aria-labelledby="course-management-title" className="fixed inset-0 z-50 m-auto w-[min(30rem,calc(100vw-2rem))] max-w-none rounded-2xl border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/60">
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="course-management-title" className="text-lg font-semibold">{mode === "delete" ? "Delete course" : archiveLabel}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{course.title}</p>
          </div>
          <button type="button" onClick={close} disabled={pending} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50" aria-label="Close"><X className="size-4" aria-hidden /></button>
        </div>
        <div className="space-y-4 px-5 py-5">
          {mode === "delete" ? (
            <>
              <p className="text-sm leading-6 text-muted-foreground">This permanently deletes {chapterCount} chapter{chapterCount === 1 ? "" : "s"}, course content, learner progress, submissions, and reviews. This cannot be undone.</p>
              {course.enrollmentCount > 0 && <label className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><input type="checkbox" checked={confirmedEnrollments} onChange={(event) => setConfirmedEnrollments(event.target.checked)} className="mt-0.5 size-4 accent-destructive" /><span>I understand {course.enrollmentCount} enrolled learner{course.enrollmentCount === 1 ? "" : "s"} will lose access and progress.</span></label>}
              <label className="block space-y-2 text-sm font-medium">Type DELETE to confirm<Input value={confirmationText} onChange={(event) => setConfirmationText(event.target.value)} autoComplete="off" placeholder="DELETE" /></label>
            </>
          ) : (
            <>
              <p className="text-sm leading-6 text-muted-foreground">{course.enrollmentCount > 0 ? "This stops new enrollments. Existing learners keep access to the course and their progress." : "This removes the course from the catalog and returns it to draft."}</p>
              {course.enrollmentCount > 0 && <label className="flex items-start gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={confirmedEnrollments} onChange={(event) => setConfirmedEnrollments(event.target.checked)} className="mt-0.5 size-4 accent-primary" /><span>I understand new learners will no longer be able to enroll.</span></label>}
            </>
          )}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={close} disabled={pending}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={() => void confirm()} disabled={!canConfirm || pending} loading={pending}>{pending ? "Working…" : mode === "delete" ? "Delete course" : archiveLabel}</Button>
        </div>
      </dialog>
    </>
  );
}
