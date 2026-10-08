import "server-only";
import { prisma } from "@/server/db";
import {
  INTEGRATION_ACCESS_KEY_HEADER,
  INTEGRATION_SECRET_KEY_HEADER,
} from "@/server/integrations/headers";
import { verifyIntegrationSecret } from "@/server/integrations/credential-hash";

export type AuthenticatedOrganization = {
  id: string;
  slug: string;
  name: string;
  credentialId: string;
};

export class IntegrationAuthError extends Error {
  constructor(message = "Invalid integration credentials") {
    super(message);
    this.name = "IntegrationAuthError";
  }
}

export function readIntegrationHeaders(request: Request): { accessKey: string; secretKey: string } {
  const accessKey = request.headers.get(INTEGRATION_ACCESS_KEY_HEADER)?.trim();
  const secretKey = request.headers.get(INTEGRATION_SECRET_KEY_HEADER)?.trim();
  if (!accessKey || !secretKey) {
    throw new IntegrationAuthError("Missing integration credentials");
  }
  return { accessKey, secretKey };
}

export async function authenticateOrganizationFromRequest(
  request: Request
): Promise<AuthenticatedOrganization> {
  const { accessKey, secretKey } = readIntegrationHeaders(request);
  const credential = await prisma.organizationApiCredential.findFirst({
    where: { accessKey, active: true },
    include: { organization: true },
  });
  if (!credential || !verifyIntegrationSecret(secretKey, credential.secretHash)) {
    throw new IntegrationAuthError();
  }

  await prisma.organizationApiCredential.update({
    where: { id: credential.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    id: credential.organization.id,
    slug: credential.organization.slug,
    name: credential.organization.name,
    credentialId: credential.id,
  };
}
