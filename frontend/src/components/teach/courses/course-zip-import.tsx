"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, parseApiResponse } from "@/lib/api-client";
import type { CourseSlugResult } from "@/shared/api/teach";

export function CourseZipImport() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  return <form className="w-full max-w-md space-y-2" onSubmit={async event => {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("archive");
    if (!(file instanceof File) || !file.size) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(["ZIP must be 5 MB or smaller."]); return; }
    setBusy(true);
    setErrors([]);
    try {
      const response = await fetch("/api/v1/teach/courses/import", {
        method: "POST", headers: { "Content-Type": "application/zip" }, body: file,
      });
      const result = await parseApiResponse<CourseSlugResult>(response);
      router.push(`/courses/${result.courseSlug}/edit`);
      router.refresh();
    } catch (error) {
      setErrors(error instanceof ApiError ? (error.errors.length ? error.errors.map(e => e.message) : [error.message]) : ["Could not import the course. Please try again."]);
    } finally { setBusy(false); }
  }}>
    <label htmlFor="course-zip" className="text-sm font-medium">Import course ZIP</label>
    <div className="flex items-center gap-2">
      <Input id="course-zip" name="archive" type="file" accept=".zip,application/zip" required disabled={busy} aria-describedby="course-zip-help" />
      <Button type="submit" disabled={busy}>{busy ? "Validating…" : "Import ZIP"}</Button>
    </div>
    <p id="course-zip-help" className="text-xs text-muted-foreground">Up to 5 MB. Include course.yaml and numbered module folders. Validated courses are saved as drafts.</p>
    {errors.length > 0 && <div role="alert" className="whitespace-pre-wrap text-sm text-destructive">{errors.join("\n")}</div>}
  </form>;
}
