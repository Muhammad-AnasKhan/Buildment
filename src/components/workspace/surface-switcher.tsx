"use client";

import { GraduationCap, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setActiveSurfaceAction } from "@/server/actions/active-surface";
import type { ActiveSurface } from "@/lib/active-surface";

export function SurfaceSwitcher({
  current,
  canInstruct,
}: {
  current: ActiveSurface;
  canInstruct: boolean;
}) {
  if (!canInstruct) return null;

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
