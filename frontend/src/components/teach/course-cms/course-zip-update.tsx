"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileArchive, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, parseApiResponse } from "@/lib/api-client";
import type { CourseUpdatePreview, CourseSlugResult, CourseUpdateAction } from "@/shared/api/teach";

const labels: Record<CourseUpdateAction, string> = {
  added: "Added", changed: "Changed", removed: "Removed · archived", restored: "Restored", moved: "Moved", unchanged: "Unchanged",
};
const colors: Record<CourseUpdateAction, string> = {
  added: "text-emerald-600", changed: "text-amber-600", removed: "text-destructive", restored: "text-emerald-600", moved: "text-blue-600", unchanged: "text-muted-foreground",
};

export function CourseZipUpdate({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<CourseUpdatePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  function close() {
    if (pending) return;
    setOpen(false); setPreview(null); setError(null); setConfirmed(false);
  }
  function showError(caught: unknown) {
    setError(caught instanceof ApiError ? caught.errors.map(e => e.message).join(" ") || caught.message : "Could not update the course. Please try again.");
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("archive");
    if (!(file instanceof File) || !file.size) { setError("Choose a course ZIP."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("ZIP must be 5 MB or smaller."); return; }
    setPending(true); setError(null); setConfirmed(false);
    try {
      const response = await fetch(`/api/v1/teach/courses/${encodeURIComponent(courseId)}/import/preview`, {
        method: "POST", headers: { "Content-Type": "application/zip" }, body: file,
      });
      setPreview(await parseApiResponse<CourseUpdatePreview>(response));
    } catch (caught) { showError(caught); }
    finally { setPending(false); }
  }
  async function approve() {
    if (!preview || !confirmed || pending) return;
    setPending(true); setError(null);
    try {
      const response = await fetch(`/api/v1/teach/courses/${encodeURIComponent(courseId)}/import/approve`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ previewId: preview.previewId, confirm: true }),
      });
      await parseApiResponse<CourseSlugResult>(response);
      setOpen(false); setPreview(null); setConfirmed(false); setSuccess(true);
      router.refresh();
    } catch (caught) { showError(caught); }
    finally { setPending(false); }
  }

  return <>
    <Button type="button" size="lg" variant="outline" onClick={() => { setSuccess(false); setOpen(true); }}><FileArchive className="size-4" aria-hidden />Update from ZIP</Button>
    {success && <p role="status" className="text-sm text-emerald-600">Course content updated.</p>}
    <dialog ref={dialogRef} onClose={close} onCancel={e => { if (pending) e.preventDefault(); }} aria-labelledby="zip-update-title" className="fixed inset-0 z-50 m-auto max-h-[90vh] w-[min(52rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-2xl border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/60">
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div><h2 id="zip-update-title" className="text-lg font-semibold">{preview ? "Review course update" : "Update course from ZIP"}</h2><p className="mt-1 text-sm text-muted-foreground">{courseTitle}</p></div>
        <button type="button" aria-label="Close" disabled={pending} onClick={close} className="rounded-lg p-2 hover:bg-muted"><X className="size-4" aria-hidden /></button>
      </div>
      {!preview ? <form onSubmit={upload} className="space-y-4 p-5">
        <p className="text-sm text-muted-foreground">Upload a course ZIP with the content you want to change. Omitted content stays as it is. Review the changes before approving.</p>
        <label className="block space-y-2 text-sm font-medium">Course ZIP (up to 5 MB)<Input type="file" name="archive" accept=".zip,application/zip" required disabled={pending} /></label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close} disabled={pending}>Cancel</Button><Button type="submit" loading={pending} disabled={pending}>{pending ? "Validating and comparing…" : "Preview changes"}</Button></div>
      </form> : <div className="space-y-5 p-5">
        <div className="rounded-xl border bg-muted/30 p-4 text-sm"><p className="font-medium">{preview.modules.filter(m => m.action === "added").length} added · {preview.modules.filter(m => m.action === "changed" || m.action === "restored").length} changed or restored · {preview.modules.filter(m => m.action === "removed").length} explicitly removed modules</p><p className="mt-1 text-muted-foreground">Approval expires at {new Date(preview.expiresAt).toLocaleTimeString()}. Learners who started keep their current release and progress.</p></div>
        {preview.variants && <div className="space-y-2"><h3 className="text-sm font-semibold">Effect by variant</h3>{preview.variants.map(variant => <p key={variant.slug} className="rounded-lg border p-3 text-sm"><strong>{variant.slug}</strong> · {variant.affectedLessons.length} lessons affected · {variant.activeLearners} active learners{variant.affectedLessons.length > 0 && <span className="block text-xs text-muted-foreground">{variant.affectedLessons.join(", ")}</span>}</p>)}</div>}
        <div className="space-y-3">{preview.modules.map((module, i) => <details key={i} open={module.action !== "unchanged"} className="rounded-xl border p-4">
          <summary className="cursor-pointer text-sm font-semibold"><span className={colors[module.action]}>{labels[module.action]}</span> · {module.title}{module.previousTitle && module.previousTitle !== module.title && <span className="font-normal text-muted-foreground"> (was {module.previousTitle})</span>}{module.previousOrder !== undefined && module.order !== undefined && module.previousOrder !== module.order && <span className="font-normal text-muted-foreground"> · position {module.previousOrder} → {module.order}</span>}</summary>
          <ul className="mt-3 divide-y">{module.chapters.map((chapter, j) => <li key={j} className="py-3 text-sm">
            <div><span className={`font-medium ${colors[chapter.action]}`}>{labels[chapter.action]}</span> · {chapter.title}</div>
            {chapter.previousTitle && chapter.previousTitle !== chapter.title && <p className="text-xs text-muted-foreground">Previously: {chapter.previousTitle}</p>}
            {(chapter.action === "moved" || chapter.action === "restored") && <p className="text-xs text-muted-foreground">{chapter.destinationModule ? `To ${chapter.destinationModule}` : chapter.previousModule ? `From ${chapter.previousModule}` : "From archived content"}</p>}
            {chapter.changes.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Changes: {chapter.changes.join(", ")}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{chapter.similarity !== null && `Similarity: ${Math.round(chapter.similarity * 100)}% · `}{chapter.reason}</p>
          </li>)}</ul>
        </details>)}</div>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">{preview.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>
        <label className="flex items-start gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={confirmed} disabled={pending} onChange={e => setConfirmed(e.target.checked)} className="mt-1" /><span>I reviewed these changes and approve the new course release.</span></label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={pending} onClick={() => { setPreview(null); setConfirmed(false); setError(null); }}>Choose another ZIP</Button><Button type="button" variant="outline" disabled={pending} onClick={close}>Cancel</Button><Button type="button" disabled={!confirmed || pending} loading={pending} onClick={() => void approve()}>{pending ? "Applying update…" : "Approve and update"}</Button></div>
      </div>}
    </dialog>
  </>;
}
