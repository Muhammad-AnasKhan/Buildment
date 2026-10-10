import type { Metadata } from "next";
import { IntegrationDocsHeader } from "@/components/integrations/integration-docs-header";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Setup guide for the Buildment Organization API — authentication, course access, enrollments, and local development.",
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <IntegrationDocsHeader />
      {children}
    </div>
  );
}
