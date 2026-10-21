"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, FileArchive, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, parseApiResponse } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { createCourse } from "@/server/actions/courses";
import type { CourseSlugResult } from "@/shared/api/teach";

type CreationMode = "new" | "import";

export function CourseCreationDialog({ zipImportEnabled }: { zipImportEnabled: boolean }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CreationMode>("new");
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    if (pending) return;
    setOpen(false);
    setMode("new");
    setTitle("");
    setError(null);
  }

  function selectMode(next: CreationMode) {
    setMode(next);
    setError(null);
    if (next === "new") window.requestAnimationFrame(() => titleRef.current?.focus());
  }

  function goToCourse(courseSlug: string) {
    setOpen(false);
    setMode("new");
    setTitle("");
    setError(null);
    router.push(`/courses/${courseSlug}/edit`);
    router.refresh();
  }

  async function submitNew(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setError("Enter a course title with at least 3 characters.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await createCourse({ title: trimmedTitle });
      if (result.ok) goToCourse(result.courseSlug);
      else setError(result.errors.join(" "));
    } catch {
      setError("Could not create the course. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function submitImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("archive");
    if (!(file instanceof File) || !file.size) {
      setError("Choose a course ZIP to import.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("ZIP must be 5 MB or smaller.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/teach/courses/import", {
        method: "POST",
        headers: { "Content-Type": "application/zip" },
        body: file,
      });
      const result = await parseApiResponse<CourseSlugResult>(response);
      goToCourse(result.courseSlug);
    } catch (caught) {
      setError(caught instanceof ApiError
        ? (caught.errors.length ? caught.errors.map(item => item.message).join(" ") : caught.message)
        : "Could not import the course. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <>
    <Button type="button" size="lg" onClick={() => setOpen(true)} className="self-start gap-2">
      <Plus className="size-4" aria-hidden />
      Create course
    </Button>

    <dialog
      ref={dialogRef}
      onClose={close}
      onCancel={(event) => { if (pending) event.preventDefault(); }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      aria-labelledby="create-course-title"
      aria-describedby="create-course-description"
      className="fixed inset-0 z-50 m-auto max-h-[min(90dvh,42rem)] w-[min(36rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/65"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Mentor workspace</p>
          <h2 id="create-course-title" className="mt-1 text-xl font-semibold tracking-tight">Create a course</h2>
          <p id="create-course-description" className="mt-1 text-sm text-muted-foreground">Choose how you want to begin.</p>
        </div>
        <button type="button" onClick={close} disabled={pending} aria-label="Close" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="space-y-6 px-6 py-6">
        {zipImportEnabled && <div className="grid gap-3 sm:grid-cols-2" aria-label="Creation method">
          <button type="button" onClick={() => selectMode("new")} disabled={pending} aria-pressed={mode === "new"} className={cn("rounded-xl border p-4 text-left transition-colors hover:border-foreground/40 disabled:opacity-50", mode === "new" ? "border-foreground bg-muted/50" : "border-border")}>
            <BookOpen className="size-5" aria-hidden />
            <span className="mt-3 block text-sm font-semibold">Start from scratch</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">Create a draft, then build your lessons.</span>
          </button>
          <button type="button" onClick={() => selectMode("import")} disabled={pending} aria-pressed={mode === "import"} className={cn("rounded-xl border p-4 text-left transition-colors hover:border-foreground/40 disabled:opacity-50", mode === "import" ? "border-foreground bg-muted/50" : "border-border")}>
            <FileArchive className="size-5" aria-hidden />
            <span className="mt-3 block text-sm font-semibold">Import a ZIP</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">Bring in an existing course package.</span>
          </button>
        </div>}

        {mode === "new" ? <form onSubmit={event => void submitNew(event)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="new-course-title" className="text-sm font-medium">Course title</label>
            <Input ref={titleRef} id="new-course-title" name="title" value={title} onChange={event => setTitle(event.target.value)} required minLength={3} maxLength={120} disabled={pending} placeholder="e.g. Build a multi-vendor marketplace" className="h-11 bg-background" />
            <p className="text-xs text-muted-foreground">You can add modules, chapters, and course details after creating the draft.</p>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={close} disabled={pending}>Cancel</Button>
            <Button type="submit" disabled={pending} loading={pending}>{pending ? "Creating…" : "Create draft course"}</Button>
          </div>
        </form> : <form onSubmit={event => void submitImport(event)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="course-zip" className="text-sm font-medium">Course ZIP file</label>
            <Input id="course-zip" name="archive" type="file" accept=".zip,application/zip" required disabled={pending} aria-describedby="course-zip-help" className="h-11 bg-background py-2" />
            <p id="course-zip-help" className="text-xs leading-5 text-muted-foreground">Up to 5 MB. Include course.yaml and numbered module folders. Imported courses are saved as drafts.</p>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={close} disabled={pending}>Cancel</Button>
            <Button type="submit" disabled={pending} loading={pending}>{pending ? "Importing…" : "Import course"}</Button>
          </div>
        </form>}
      </div>
    </dialog>
  </>;
}
