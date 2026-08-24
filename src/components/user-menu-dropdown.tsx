"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";

type UserMenuDropdownProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
  compact?: boolean;
  signOutAction: () => Promise<void>;
  homeHref?: string;
  showProgress?: boolean;
};

export function UserMenuDropdown({
  user,
  compact = false,
  signOutAction,
  homeHref = "/dashboard",
  showProgress = true,
}: UserMenuDropdownProps) {
  const router = useRouter();
  const displayName = user.name ?? user.email ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="rounded-full outline-none ring-offset-2 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-neutral-300"
            aria-label="Open account menu"
          />
        }
      >
        <UserAvatar user={user} compact={compact} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium text-neutral-950">{displayName}</p>
            {user.email && user.name && (
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(homeHref)}>
          <LayoutDashboard className="size-4" />
          Home
        </DropdownMenuItem>
        {showProgress && (
          <DropdownMenuItem onClick={() => router.push("/progress")}>
            <TrendingUp className="size-4" />
            My progress
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void signOutAction();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
