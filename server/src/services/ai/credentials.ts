import type { AiCredentialStatus } from "../../shared/api/ai.js";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import { decryptSecret, encryptSecret, parseEncryptionKey } from "./credential-crypto.js";
import { AiError, checkGeminiKey, checkOpenRouterKey, defaultInterviewModel, type AiProviderName } from "./openrouter.js";

// One OpenRouter key per learner, stored as AES-256-GCM ciphertext. Status
// responses expose only the last four characters; the plaintext exists in
// memory only while a request to OpenRouter is being made.

type Deps = { encryptionKey?: Buffer | null; fetchImpl?: typeof fetch };

function serverKey(deps: Deps): Buffer | null {
  return deps.encryptionKey !== undefined ? deps.encryptionKey : parseEncryptionKey(env.AI_KEY_ENCRYPTION_KEY);
}

function requireServerKey(deps: Deps): Buffer {
  const key = serverKey(deps);
  if (!key) throw new AiError("AI_NOT_CONFIGURED");
  return key;
}

type CredentialRow = { provider: AiProviderName; lastFour: string; model: string | null; updatedAt: Date; lastUsedAt: Date | null };

function toStatus(configured: boolean, row: CredentialRow | null): AiCredentialStatus {
  return {
    configured,
    hasKey: Boolean(row),
    provider: row?.provider ?? "OPENROUTER",
    lastFour: row?.lastFour ?? null,
    model: row?.model ?? null,
    defaultModel: defaultInterviewModel(row?.provider ?? "OPENROUTER"),
    updatedAt: row?.updatedAt.toISOString() ?? null,
    lastUsedAt: row?.lastUsedAt?.toISOString() ?? null,
  };
}

const statusSelect = { provider: true, lastFour: true, model: true, updatedAt: true, lastUsedAt: true } as const;

export async function getAiCredentialStatus(userId: string, deps: Deps = {}): Promise<AiCredentialStatus> {
  const row = await prisma.aiCredential.findUnique({ where: { userId }, select: statusSelect });
  return toStatus(serverKey(deps) !== null, row);
}

/** Check the key with OpenRouter, then store it encrypted. Replaces any earlier key. */
export async function saveAiCredential(
  userId: string,
  input: { provider: AiProviderName; apiKey: string; model?: string | null },
  deps: Deps = {}
): Promise<AiCredentialStatus> {
  const key = requireServerKey(deps);
  const apiKey = input.apiKey.trim();
  if (input.provider === "GEMINI") await checkGeminiKey(apiKey, { fetchImpl: deps.fetchImpl });
  else await checkOpenRouterKey(apiKey, { fetchImpl: deps.fetchImpl });
  const encrypted = encryptSecret(apiKey, key, userId);
  const data = { ...encrypted, provider: input.provider, lastFour: apiKey.slice(-4), model: input.model ?? null };
  const row = await prisma.aiCredential.upsert({
    where: { userId },
    create: { userId, ...data },
    update: { ...data, lastUsedAt: null },
    select: statusSelect,
  });
  return toStatus(true, row);
}

export async function updateAiCredentialModel(userId: string, model: string | null, deps: Deps = {}): Promise<AiCredentialStatus> {
  requireServerKey(deps);
  const existing = await prisma.aiCredential.findUnique({ where: { userId }, select: { id: true } });
  if (!existing) throw new NotFoundError("Save an AI provider key first.", "AI_KEY_REQUIRED");
  const row = await prisma.aiCredential.update({ where: { userId }, data: { model }, select: statusSelect });
  return toStatus(true, row);
}

export async function deleteAiCredential(userId: string): Promise<void> {
  await prisma.aiCredential.deleteMany({ where: { userId } });
}

/** The plaintext key and model for one request. Never return this from a route. */
export async function loadAiKeyForUse(userId: string, deps: Deps = {}): Promise<{ provider: AiProviderName; apiKey: string; model: string }> {
  const key = requireServerKey(deps);
  const row = await prisma.aiCredential.findUnique({ where: { userId } });
  if (!row) throw new AiError("AI_KEY_REQUIRED");
  let apiKey: string;
  try {
    apiKey = decryptSecret(row, key, userId);
  } catch {
    // Wrong server key or a tampered row: the learner can fix it by saving the key again.
    throw new AiError("AI_KEY_INVALID", "Your saved key could not be read. Please paste it again in settings.");
  }
  await prisma.aiCredential.update({ where: { userId }, data: { lastUsedAt: new Date() } });
  return { provider: row.provider, apiKey, model: row.model ?? defaultInterviewModel(row.provider) };
}

/** Re-check the stored key with OpenRouter (the settings "Test" button). */
export async function testAiCredential(userId: string, deps: Deps = {}): Promise<AiCredentialStatus> {
  const { provider, apiKey } = await loadAiKeyForUse(userId, deps);
  if (provider === "GEMINI") await checkGeminiKey(apiKey, { fetchImpl: deps.fetchImpl });
  else await checkOpenRouterKey(apiKey, { fetchImpl: deps.fetchImpl });
  return getAiCredentialStatus(userId, deps);
}
