"use client";

import { Check, ChevronsUpDown, GraduationCap, LayoutDashboard, LogOut, Plug, Settings, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setActiveSurfaceAction } from "@/server/actions/active-surface";
import { requestInstructorAccessAction } from "@/server/actions/instructor-access";
import type { InstructorAccessView } from "@/shared/lib/instructor-access";
import { cn } from "@/lib/utils";

export function WorkspaceAccountMenu({
  current,
  user,
  instructorAccess,
  signOutAction,
  compact = false,
}: {
  current: "learn" | "teach" | "admin";
  user: { name?: string | null; email?: string | null; role?: string };
  instructorAccess?: InstructorAccessView;
  signOutAction: () => Promise<void>;
  compact?: boolean;
}) {
  const router = useRouter();
  const role = instructorAccess?.role ?? user.role;
  const isAdmin = role === "ADMIN";
  const canTeach = isAdmin || role === "MENTOR";
  const label = { learn: "Learner", teach: "Instructor", admin: "Admin" }[current];
  const name = user.name || user.email || label;
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const profile = { learn: "/settings/profile", teach: "/workspace/settings/profile", admin: "/admin/settings/profile" }[current];
  const surfaces = [
    { key: "learn" as const, label: "Learner", icon: GraduationCap, visible: true },
    { key: "teach" as const, label: "Instructor", icon: LayoutDashboard, visible: canTeach },
    { key: "admin" as const, label: "Admin", icon: Shield, visible: isAdmin },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button type="button" aria-label={`Account and workspace: ${label}`} className={cn(
          "flex items-center rounded-lg text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "size-10 justify-center" : "w-full gap-2.5 p-2",
        )} />}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary" aria-hidden="true">{initials}</span>
        {!compact && <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="block text-xs text-muted-foreground">{label} workspace</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </>}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={compact ? "bottom" : "top"} align={compact ? "end" : "start"} className="w-60 max-w-[calc(100vw-2rem)] p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2 font-normal">
            <span className="block truncate font-medium text-foreground">{name}</span>
            <span className="block truncate text-xs">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          {surfaces.filter((surface) => surface.visible).map(({ key, label: surfaceLabel, icon: Icon }) => (
            <DropdownMenuItem key={key} className="min-h-9 gap-2 px-2" disabled={current === key} onClick={() => {
              if (key === "admin") router.push("/admin");
              else void setActiveSurfaceAction(key);
            }}>
              <Icon className="size-4" />
              <span className="flex-1">{surfaceLabel}</span>
              {current === key && <Check className="size-4" aria-label="Current workspace" />}
            </DropdownMenuItem>
          ))}
          {!canTeach && instructorAccess?.requestStatus === "pending" && (
            <DropdownMenuItem disabled className="min-h-9 gap-2 px-2">
              <LayoutDashboard className="size-4" /> Instructor access pending
            </DropdownMenuItem>
          )}
          {!canTeach && instructorAccess?.canRequestAccess && instructorAccess.requestStatus !== "pending" && (
            <DropdownMenuItem className="min-h-9 gap-2 px-2" onClick={() => void requestInstructorAccessAction(new FormData())}>
              <LayoutDashboard className="size-4" />
              {instructorAccess.requestStatus === "rejected" ? "Request instructor access again" : "Request instructor access"}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="min-h-9 gap-2 px-2" onClick={() => router.push(profile)}>
          <Settings className="size-4" /> Profile settings
        </DropdownMenuItem>
        {isAdmin && <DropdownMenuItem className="min-h-9 gap-2 px-2" onClick={() => router.push("/integrations")}>
          <Plug className="size-4" /> Integration API
        </DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="min-h-9 gap-2 px-2" variant="destructive" onClick={() => void signOutAction()}>
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
