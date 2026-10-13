import { IntegrationDocsContent } from "@/components/integrations/integration-docs-content";

export default function IntegrationsDocsPage() {
  // Public base URL of this deployment; /integrations/v1 is proxied to the API from here.
  const baseUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return <IntegrationDocsContent baseUrl={baseUrl} />;
}
