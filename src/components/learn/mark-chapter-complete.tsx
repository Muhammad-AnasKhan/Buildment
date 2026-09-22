"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markChapterComplete } from "@/server/actions/progress";

export function MarkChapterComplete({
  chapterId,
  alreadyComplete,
}: {
  chapterId: string;
  alreadyComplete: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (alreadyComplete) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
        <CheckCircle2 className="size-4" aria-hidden />
        Chapter complete — the next lesson is unlocked.
      </p>
    );
  }

  function onMark() {
    setError(null);
    startTransition(async () => {
      const result = await markChapterComplete({ chapterId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <Button
        type="button"
        size="sm"
        onClick={onMark}
        disabled={pending}
        className="h-10 rounded-full bg-neutral-950 px-5 text-sm font-medium text-white hover:bg-neutral-800"
      >
        {pending ? "Saving…" : "Mark chapter complete"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : (
        <p className="text-xs text-neutral-500">
          Unlocks the next chapter. Checkpoints you already submitted stay on your record.
        </p>
      )}
    </div>
  );
}
