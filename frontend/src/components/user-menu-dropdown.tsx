"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LayoutDashboard, Loader2, LogOut, TrendingUp } from "lucide-react";
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
  const [pending, startTransition] = useTransition();
  const displayName = user.name ?? user.email ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="rounded-full outline-none ring-offset-2 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-neutral-300"
            aria-label="Open account menu"
            disabled={pending}
            aria-busy={pending || undefined}
          />
        }
      >
        <span className="relative inline-flex">
          <span className={pending ? "opacity-0" : undefined}><UserAvatar user={user} compact={compact} /></span>
          {pending && <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          </span>}
        </span>
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
        <DropdownMenuItem disabled={pending} onClick={() => startTransition(() => router.push(homeHref))}>
          <LayoutDashboard className="size-4" />
          Home
        </DropdownMenuItem>
        {showProgress && (
          <DropdownMenuItem disabled={pending} onClick={() => startTransition(() => router.push("/progress"))}>
            <TrendingUp className="size-4" />
            My progress
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={() => {
            startTransition(async () => { await signOutAction(); });
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
