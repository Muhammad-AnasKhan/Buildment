import type { Metadata } from "next";
import type { MenteeDashboardViewModel } from "@/shared/api/learner";
import { MenteeDashboard } from "@/components/learn/dashboard/mentee-dashboard";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";

export const metadata: Metadata = { title: "Home" };

export default async function MenteeDashboardPage() {
  await requireLearnSurface();
  const model = await serverApiFetch<MenteeDashboardViewModel>("/api/v1/learner/dashboard");
  return <MenteeDashboard model={model} />;
}
