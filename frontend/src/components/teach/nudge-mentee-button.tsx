"use client";

import { useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nudgeMenteeAction } from "@/server/actions/nudge-mentee";

export function NudgeMenteeButton({ enrollmentId }: { enrollmentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      className="h-8 gap-1 text-xs"
      onClick={() => {
        startTransition(async () => {
          await nudgeMenteeAction({ enrollmentId });
        });
      }}
    >
      <Bell className="size-3.5" aria-hidden />
      {pending ? "Sending…" : "Nudge"}
    </Button>
  );
}
