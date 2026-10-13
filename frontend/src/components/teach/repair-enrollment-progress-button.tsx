"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { repairEnrollmentProgressAction } from "@/server/actions/progress";

export function RepairEnrollmentProgressButton({ enrollmentId }: { enrollmentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-8 gap-1.5 text-xs text-neutral-600"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await repairEnrollmentProgressAction({ enrollmentId });
          window.location.reload();
        });
      }}
    >
      <RefreshCw className={pending ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden />
      Recalculate progress
    </Button>
  );
}
