"use client";

import { Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { publishChapters } from "@/server/actions/chapters";

export function PublishChaptersButton({ scope, disabled = false, compact = false }: {
  scope: { courseId: string } | { moduleId: string };
  disabled?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  return <div className="min-w-0 max-w-md space-y-2">
    <Button variant={compact ? "ghost" : "outline"} size="sm" className={compact ? "text-muted-foreground hover:text-foreground" : undefined} disabled={disabled || pending} onClick={async () => {
      setPending(true);
      setMessage("");
      try {
        const result = await publishChapters(scope);
        setFailed(!result.ok);
        setMessage(result.ok ? "All chapters are published." : result.errors.join("\n"));
        if (result.ok) router.refresh();
      } catch {
        setFailed(true);
        setMessage("Could not publish chapters. Please try again.");
      } finally { setPending(false); }
    }}>
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
      {pending ? "Publishing…" : compact ? "Publish chapters" : "Publish all chapters"}
    </Button>
    {message && <p role={failed ? "alert" : "status"} className={`whitespace-pre-wrap text-xs ${failed ? "text-destructive" : "text-muted-foreground"}`}>{message}</p>}
  </div>;
}
