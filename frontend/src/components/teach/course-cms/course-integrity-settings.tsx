"use client";

import { useState, useTransition } from "react";
import { Camera, ShieldCheck } from "lucide-react";
import { updateCourseIntegrity } from "@/server/actions/modules";
import { INTEGRITY_LIMITS } from "@/shared/api/integrity";

// Quiz integrity signals are always on in quiz chapters. The camera is the one
// part an instructor opts into, per course. It stays off by default and is never required.

export function CourseIntegritySettings({ courseId, integritySnapshots }: { courseId: string; integritySnapshots: boolean }) {
  const [enabled, setEnabled] = useState(integritySnapshots);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const change = (next: boolean) => {
    const previous = enabled;
    setEnabled(next);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateCourseIntegrity({ courseId, integritySnapshots: next });
      if (result.ok) {
        setSaved(true);
      } else {
        setEnabled(previous);
        setError(result.errors[0] ?? "Could not save. Try again.");
      }
    });
  };

  return (
    <section id="quiz-integrity" aria-labelledby="quiz-integrity-title" className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-start gap-3 border-b bg-muted/15 px-5 py-4 sm:px-6">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground"><ShieldCheck className="size-4" aria-hidden /></span>
        <div>
          <h2 id="quiz-integrity-title" className="text-base font-semibold">Quiz integrity</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Quiz chapters always note tab switches, leaving full screen, blocked copy and paste, and similar signals for mentors. Nothing fails a quiz automatically.
          </p>
        </div>
      </div>
      <div className="space-y-3 p-5 sm:p-6">
        <label className="flex items-start gap-3 rounded-xl border bg-muted/25 p-4">
          <input
            type="checkbox"
            checked={enabled}
            disabled={pending}
            onChange={(event) => change(event.target.checked)}
            className="mt-1 size-4 accent-primary"
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-medium"><Camera className="size-4" aria-hidden />Ask learners for camera photos during quizzes</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              Learners choose yes or no on a consent screen before each quiz. A small {INTEGRITY_LIMITS.snapshotWidth} x {INTEGRITY_LIMITS.snapshotHeight} still is taken about once a minute (around 10 KB, fine on weak connections). Only this course&apos;s mentors and admins can see the photos, and they are deleted after {INTEGRITY_LIMITS.retentionDays} days. No camera, or saying no, never blocks the quiz; the mentor sees &quot;camera off&quot;.
            </span>
          </span>
        </label>
        <p role="status" aria-live="polite" className="min-h-5 text-xs">
          {pending ? <span className="text-muted-foreground">Saving…</span> : error ? <span className="text-destructive">{error}</span> : saved ? <span className="text-muted-foreground">Saved.</span> : null}
        </p>
      </div>
    </section>
  );
}
