import { prisma } from "../../db/prisma.js";
import { UnauthorizedError } from "../../utils/errors.js";
import type { AuthenticatedOrganization } from "../../types/auth.js";
import { verifyIntegrationSecret } from "./credential-hash.js";

export class IntegrationAuthError extends UnauthorizedError {
  constructor(message = "Invalid integration credentials") {
    super(message, "INTEGRATION_AUTH");
  }
}

/** Resolves an access/secret key pair to its organisation and stamps last use. */
export async function authenticateOrganization(credentials: {
  accessKey?: string;
  secretKey?: string;
}): Promise<AuthenticatedOrganization> {
  const accessKey = credentials.accessKey?.trim();
  const secretKey = credentials.secretKey?.trim();
  if (!accessKey || !secretKey) {
    throw new IntegrationAuthError("Missing integration credentials");
  }

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
