import { MenteeDashboard } from "@/components/learn/dashboard/mentee-dashboard";
import { requireLearnSurface } from "@/server/auth/guards";
import { loadMenteeDashboard } from "@/server/dashboard/load-mentee-dashboard";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";

export default async function MenteeDashboardPage() {
  const user = await requireLearnSurface();
  const model = await loadMenteeDashboard({
    learnerId: user.id,
    learnerName: user.name?.trim() || user.email?.split("@")[0] || "there",
    bypassLocking: bypassProgressGatingForEmail(user.email ?? ""),
  });

  return <MenteeDashboard model={model} />;
}
