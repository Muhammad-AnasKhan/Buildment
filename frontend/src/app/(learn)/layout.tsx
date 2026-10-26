import { requireLearnSurface } from "@/server/auth/guards";
import { AppActivityTracker } from "@/components/app-activity-tracker";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { MascotPlayer } from "@/components/mascot/mascot-player";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  await requireLearnSurface();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppActivityTracker />
      <NotificationCenter />
      <MascotPlayer />
      {children}
    </div>
  );
}
