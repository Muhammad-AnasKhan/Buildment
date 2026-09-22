"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { replyToHelpThread } from "@/server/actions/help";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpNoteTimeline } from "./help-note-timeline";
import type { HelpMessageView } from "./help-types";

export function MenteeHelpThreadView({
  threadId,
  status,
  messages,
  viewerId,
}: {
  threadId: string;
  status: "OPEN" | "RESOLVED";
  messages: HelpMessageView[];
  viewerId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
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

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <HelpNoteTimeline messages={messages} viewerId={viewerId} />
      </section>

      {status === "OPEN" ? (
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <label htmlFor="mentee-followup" className="text-sm font-semibold text-neutral-900">
            Add to your note
          </label>
          <p className="mt-1 text-xs text-neutral-500">
            Your mentor gets this on their Mentee requests list.
          </p>
          <Textarea
            id="mentee-followup"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="mt-3 min-h-[100px] border-neutral-200 text-[15px] leading-relaxed"
            placeholder="More detail on what you're stuck on…"
            disabled={pending}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-lg bg-neutral-900 px-4 text-white hover:bg-neutral-800"
              disabled={pending || body.trim().length < 10}
              onClick={submit}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                "Send update"
              )}
            </Button>
          </div>
        </section>
      ) : (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          Resolved — use <strong className="font-medium">Ask for help</strong> on the chapter to start a
          new note.
        </p>
      )}
    </div>
  );
}
