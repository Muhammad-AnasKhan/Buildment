import { requireRole } from "@/server/auth/guards";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  await requireRole("MENTEE");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-neutral-50">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.08),transparent)]"
        aria-hidden
      />
      {children}
    </div>
  );
}
