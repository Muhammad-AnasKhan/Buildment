import { appBaseUrl } from "@/server/email/send";
import { IntegrationDocsContent } from "@/components/integrations/integration-docs-content";

export default function IntegrationsDocsPage() {
  return <IntegrationDocsContent baseUrl={appBaseUrl()} />;
}
