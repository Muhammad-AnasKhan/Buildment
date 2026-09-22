"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Phone } from "lucide-react";
import { replyToHelpThread, resolveHelpThread } from "@/server/actions/help";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpNoteTimeline } from "./help-note-timeline";
import type { HelpMessageView } from "./help-types";

export function MentorHelpThread({
  threadId,
  status,
  messages,
  mentorId,
  menteeName,
}: {
  threadId: string;
  status: "OPEN" | "RESOLVED";
  messages: HelpMessageView[];
  mentorId: string;
  menteeName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isOpen = status === "OPEN";

  function sendReply() {
    setError(null);
    startTransition(async () => {
      const result = await replyToHelpThread({ threadId, body });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  function markResolved() {
    setError(null);
    startTransition(async () => {
      const result = await resolveHelpThread({ threadId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-neutral-900">Help note thread</h2>
          <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
            <HelpNoteTimeline messages={messages} viewerId={mentorId} />
          </div>
        </section>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {isOpen ? (
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <label htmlFor="mentor-reply" className="text-sm font-semibold text-neutral-900">
              Write a reply
            </label>
            <p className="mt-1 text-xs text-neutral-500">
              Your mentee sees this when they reopen the lesson or check My help notes.
            </p>
            <Textarea
              id="mentor-reply"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
              className="mt-3 min-h-[120px] border-neutral-200 text-[15px] leading-relaxed"
              placeholder="Point them to the step, concept, or file to check…"
              disabled={pending}
            />
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-neutral-200"
                disabled={pending}
                onClick={markResolved}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                )}
                Mark resolved
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-lg bg-neutral-900 px-5 text-white hover:bg-neutral-800"
                disabled={pending || body.trim().length < 10}
                onClick={sendReply}
              >
                {pending ? "Sending…" : "Send reply"}
              </Button>
            </div>
          </section>
        ) : (
          <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            Resolved — the mentee can open a new note from the chapter if they need more help.
          </p>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Mentee</p>
          <p className="mt-1 text-sm font-semibold text-neutral-900">{menteeName}</p>
        </div>
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <Phone className="size-4 text-neutral-400" aria-hidden />
            Meet with mentee
          </div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Live call and screen share will live here — for now, use written replies above.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="mt-3 h-9 w-full rounded-lg border-neutral-200 text-neutral-400"
          >
            Start call (coming soon)
          </Button>
        </div>
      </aside>
    </div>
  );
}
