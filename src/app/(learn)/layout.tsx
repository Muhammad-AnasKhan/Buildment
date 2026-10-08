import { requireLearnSurface } from "@/server/auth/guards";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  await requireLearnSurface();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">{children}</div>
  );
}
