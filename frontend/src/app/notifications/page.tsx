import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { requireVerifiedUser, surfaceHomeRoute } from "@/server/auth/guards";
import { getActiveSurface } from "@/server/auth/surface";
import { Logo } from "@/components/brand/logo";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationFeedList } from "@/components/notifications/notification-feed-list";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

// Every surface (learn, teach, admin) links here from its bell and from email footers, so the page
// lives outside the surface route groups and only needs a signed-in, verified account.
export default async function NotificationsPage() {
  const user = await requireVerifiedUser();
  const activeSurface = await getActiveSurface(user.role);
  const homeHref = user.role === "ADMIN" ? "/admin" : surfaceHomeRoute(activeSurface);
  const settingsHref =
    user.role === "ADMIN"
      ? "/admin/settings/profile#notifications"
      : activeSurface === "teach"
        ? "/workspace/settings/profile#notifications"
        : "/settings/profile#notifications";

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <NotificationCenter />
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={homeHref} aria-label="Back to your workspace">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={settingsHref}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
            >
              <Settings className="size-3.5" aria-hidden />
              Settings
            </Link>
            <NotificationBell />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <div>
          <Link
            href={homeHref}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to your workspace
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Unread messages and reviews stay on top. New ones also appear live while Edorax is open.
          </p>
        </div>

        <NotificationFeedList />

        <p className="text-sm text-muted-foreground">
          Prefer email or fewer pings? Manage channels in{" "}
          <Link href={settingsHref} className="font-medium text-primary underline-offset-4 hover:underline">
            notification settings
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
