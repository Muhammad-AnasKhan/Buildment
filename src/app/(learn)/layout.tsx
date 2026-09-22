import { requireRole } from "@/server/auth/guards";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  await requireRole("MENTEE");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">{children}</div>
  );
}
