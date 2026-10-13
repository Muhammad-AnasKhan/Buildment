"use client";

import { GraduationCap, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setActiveSurfaceAction } from "@/server/actions/active-surface";
import { requestInstructorAccessAction } from "@/server/actions/instructor-access";
import type { ActiveSurface } from "@/lib/active-surface";
import type { InstructorAccessView } from "@/lib/instructor-access";

export function SurfaceSwitcher({
  current,
  instructorAccess,
}: {
  current: ActiveSurface;
  instructorAccess: InstructorAccessView;
}) {
  if (instructorAccess.canInstruct) {
    const target = current === "learn" ? "teach" : "learn";
    const label =
      current === "learn" ? "Switch to instructor" : "Switch to learning";
    const Icon = current === "learn" ? LayoutDashboard : GraduationCap;

    return (
      <form action={setActiveSurfaceAction.bind(null, target)}>
        <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Icon className="size-4 shrink-0 opacity-70" />
          {label}
        </Button>
      </form>
    );
  }

  if (instructorAccess.requestStatus === "pending") {
    return (
      <p className="px-2 py-1.5 text-xs leading-relaxed text-muted-foreground">
        Instructor access request is pending admin review.
      </p>
    );
  }

  if (instructorAccess.canRequestAccess) {
    return (
      <form action={requestInstructorAccessAction}>
        <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
          <LayoutDashboard className="size-4 shrink-0 opacity-70" />
          {instructorAccess.requestStatus === "rejected"
            ? "Request instructor access again"
            : "Request instructor access"}
        </Button>
      </form>
    );
  }

  return null;
}
