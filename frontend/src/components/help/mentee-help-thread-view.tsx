"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { replyToHelpThread } from "@/server/actions/help";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/app-toast";
import { HelpNoteTimeline } from "./help-note-timeline";
import type { HelpMessageView } from "./help-types";
import { helpUiCopy as copy } from "@/lib/help-ui-copy";

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
        toast(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5">
        <HelpNoteTimeline messages={messages} viewerId={viewerId} />
      </section>

      {status === "OPEN" ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <label htmlFor="mentee-followup" className="text-sm font-semibold text-foreground">
            {copy.composerFollowUp}
          </label>
          <p className="mt-1 text-xs text-muted-foreground">{copy.mentorSeesInbox}</p>
          <Textarea
            id="mentee-followup"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="mt-3 min-h-[100px] border-border text-[15px] leading-relaxed"
            placeholder="More detail on what you're stuck on…"
            disabled={pending}
          />
          {error && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-lg px-4"
              disabled={pending || body.trim().length < 10}
              onClick={submit}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                copy.sendFollowUp
              )}
            </Button>
          </div>
        </section>
      ) : (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Resolved — use <strong className="font-medium">{copy.resolvedAskAgain}</strong> on the chapter
          to {copy.resolvedStartNew}.
        </p>
      )}
    </div>
  );
}
