import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { NotificationPreferences } from "@/shared/api/notifications";
import { requireVerifiedUser, surfaceHomeRoute } from "@/server/auth/guards";
import { getActiveSurface } from "@/server/auth/surface";
import { serverApiFetch } from "@/lib/api-server";
import { Logo } from "@/components/brand/logo";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationFeedList } from "@/components/notifications/notification-feed-list";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";

export const metadata: Metadata = { title: "Notifications" };

// Every surface (learn, teach, admin) links here from its bell and from email footers, so the page
// lives outside the surface route groups and only needs a signed-in, verified account.
export default async function NotificationsPage() {
  const user = await requireVerifiedUser();
  const preferences = await serverApiFetch<NotificationPreferences>("/api/v1/notifications/preferences");
  const homeHref = user.role === "ADMIN" ? "/admin" : surfaceHomeRoute(await getActiveSurface(user.role));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <NotificationCenter />
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={homeHref} aria-label="Back to your workspace">
            <Logo size="sm" />
          </Link>
          <NotificationBell />
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
            Everything that needed your attention, newest first. New ones also appear live while Buildment is open.
          </p>
        </div>

        <NotificationFeedList />

        <section aria-labelledby="notification-settings" className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <h2 id="notification-settings" className="text-lg font-semibold tracking-tight">
            Notification settings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose where each kind of notification reaches you. Study reminders come at most once a day across all your courses.
          </p>
          <NotificationPreferencesForm initial={preferences} showAdmin={user.role === "ADMIN"} />
        </section>
      </main>
    </div>
  );
}
