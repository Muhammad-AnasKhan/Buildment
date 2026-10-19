"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenText,
  CircleHelp,
  Gauge,
  GraduationCap,
  Menu,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { WorkspaceAccountMenu } from "@/components/workspace/workspace-account-menu";
import { Logo } from "@/components/brand/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { helpUiCopy } from "@/shared/lib/help-ui-copy";
import type { InstructorAccessView } from "@/shared/lib/instructor-access";

type LearnerNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
  count?: number;
};

export function MenteeWorkspaceShell({
  children,
  user,
  instructorAccess,
  assignedCourses,
  openHelpRequests,
  pendingReviews,
  signOutAction,
}: {
  children: ReactNode;
  user: { name?: string | null; email?: string | null; role?: string };
  instructorAccess: InstructorAccessView;
  assignedCourses: number;
  openHelpRequests: number;
  pendingReviews: number;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Course overviews and chapter readers have their own focused navigation.
  if (pathname.startsWith("/courses/")) return children;

  const mainItems: LearnerNavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Gauge,
      active: pathname === "/dashboard",
    },
    {
      label: "Catalog",
      href: "/catalog",
      icon: GraduationCap,
      active: pathname.startsWith("/catalog"),
    },
    {
      label: "My courses",
      href: "/my-courses",
      icon: BookOpenText,
      active: pathname === "/my-courses",
      count: assignedCourses,
    },
    {
      label: "My progress",
      href: "/progress",
      icon: TrendingUp,
      active: pathname === "/progress",
    },
  ];
  const supportItems: LearnerNavItem[] = [
    {
      label: helpUiCopy.learnerNav,
      href: "/my-questions",
      icon: CircleHelp,
      active: pathname.startsWith("/my-questions"),
      count: openHelpRequests,
    },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
        <Link href="/dashboard" aria-label="Learner dashboard">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <WorkspaceAccountMenu current="learn" user={user} instructorAccess={instructorAccess} signOutAction={signOutAction} compact />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-lg border bg-card outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Open learner workspace navigation"
                />
              }
            >
              <Menu className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(21rem,calc(100vw-2rem))] p-1.5">
              <MobileItems label="Learning" items={mainItems} onNavigate={router.push} />
              <DropdownMenuSeparator />
              <MobileItems label="Support" items={supportItems} onNavigate={router.push} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r bg-card lg:flex lg:flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4">
          <Link
            href="/dashboard"
            className="inline-flex outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo size="sm" />
          </Link>
          <NotificationBell />
        </div>

        <nav aria-label="Learner workspace" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
          <SidebarGroup label="Learning" items={mainItems} />
          <SidebarGroup label="Support" items={supportItems} />
          {pendingReviews > 0 ? (
            <p className="px-2 text-xs leading-5 text-muted-foreground">
              {pendingReviews} submission{pendingReviews === 1 ? "" : "s"} awaiting review
            </p>
          ) : null}
        </nav>

        <div className="shrink-0 border-t p-2">
          <WorkspaceAccountMenu current="learn" user={user} instructorAccess={instructorAccess} signOutAction={signOutAction} />
        </div>
      </aside>

      <main className="min-h-dvh lg:pl-60">{children}</main>
    </div>
  );
}

function SidebarGroup({ label, items }: { label: string; items: LearnerNavItem[] }) {
  return (
    <div>
      <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                item.active
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.count !== undefined ? <Count value={item.count} active={item.active} /> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MobileItems({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: LearnerNavItem[];
  onNavigate: (href: string) => void;
}) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>{label}</DropdownMenuLabel>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <DropdownMenuItem
            key={item.href}
            className={cn(item.active && "bg-accent font-medium")}
            onClick={() => onNavigate(item.href)}
          >
            <Icon className="size-4" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.count !== undefined ? <Count value={item.count} active={false} /> : null}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuGroup>
  );
}

function Count({ value, active }: { value: number; active: boolean }) {
  return (
    <span
      className={cn(
        "min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums",
        active ? "bg-background/15 text-background" : "bg-muted text-muted-foreground"
      )}
    >
      {value > 99 ? "99+" : value}
    </span>
  );
}
