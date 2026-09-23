"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenText,
  CircleHelp,
  Gauge,
  GraduationCap,
  LogOut,
  Menu,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
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
  assignedCourses,
  openHelpRequests,
  pendingReviews,
  signOutAction,
}: {
  children: ReactNode;
  user: { name?: string | null; email?: string | null };
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
      label: "My help notes",
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
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-sm font-medium text-foreground">
                  {user.name ?? "Learner"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuItem variant="destructive" onClick={() => void signOutAction()}>
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-card lg:flex lg:flex-col">
        <div className="border-b px-5 py-5">
          <Link
            href="/dashboard"
            className="inline-flex outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo size="md" />
          </Link>
          <p className="mt-1 pl-[2.625rem] text-xs text-muted-foreground">Learner workspace</p>
        </div>

        <div className="border-b p-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/45 px-3 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-background text-muted-foreground shadow-sm ring-1 ring-border">
              <GraduationCap className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Learning space
              </span>
              <span className="mt-0.5 block text-sm font-semibold">
                {assignedCourses === 0
                  ? "No assigned courses"
                  : `${assignedCourses} assigned course${assignedCourses === 1 ? "" : "s"}`}
              </span>
            </span>
          </div>
        </div>

        <nav aria-label="Learner workspace" className="flex-1 space-y-5 overflow-y-auto p-3">
          <SidebarGroup label="Learning" items={mainItems} />
          <SidebarGroup label="Support" items={supportItems} />
          {pendingReviews > 0 ? (
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs font-medium">Mentor review</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {pendingReviews} submission{pendingReviews === 1 ? " is" : "s are"} waiting for feedback.
              </p>
            </div>
          ) : null}
        </nav>

        <div className="border-t p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium">{user.name ?? "Learner"}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{user.email}</span>
            </span>
            <button
              type="button"
              onClick={() => void signOutAction()}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-dvh lg:pl-72">{children}</main>
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
