"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function MobileNavMenu({
  links,
}: {
  links: { href: string; label: string; badge?: number }[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-label="Open main navigation"
          />
        }
      >
        <Menu className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Navigation</DropdownMenuLabel>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <DropdownMenuItem
                key={link.href}
                className={cn("py-2", active && "bg-accent font-medium")}
                onClick={() => router.push(link.href)}
              >
                <span className="min-w-0 flex-1 truncate">{link.label}</span>
                {link.badge != null && link.badge > 0 ? (
                  <span className="min-w-5 rounded-full bg-foreground px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums text-background">
                    {link.badge > 99 ? "99+" : link.badge}
                  </span>
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
