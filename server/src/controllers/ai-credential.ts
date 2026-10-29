import type { Request, Response } from "express";
import { noContent, ok } from "../utils/responses.js";
import {
  deleteAiCredential,
  getAiCredentialStatus,
  saveAiCredential,
  testAiCredential,
  updateAiCredentialModel,
} from "../services/ai/credentials.js";

// The learner's own OpenRouter key. Responses carry status only, never the key.

// GET /api/v1/learner/ai-credential
export async function status(req: Request, res: Response) {
  ok(res, await getAiCredentialStatus(req.user!.id));
}

// PUT /api/v1/learner/ai-credential
export async function save(req: Request, res: Response) {
  const { provider, apiKey, model } = req.body as { provider: "OPENROUTER" | "GEMINI"; apiKey: string; model?: string | null };
  ok(res, await saveAiCredential(req.user!.id, { provider, apiKey, model }));
}

// PATCH /api/v1/learner/ai-credential
export async function updateModel(req: Request, res: Response) {
  ok(res, await updateAiCredentialModel(req.user!.id, (req.body as { model: string | null }).model));
}

// POST /api/v1/learner/ai-credential/test
export async function test(req: Request, res: Response) {
  ok(res, await testAiCredential(req.user!.id));
}

// DELETE /api/v1/learner/ai-credential
export async function remove(req: Request, res: Response) {
  await deleteAiCredential(req.user!.id);
  noContent(res);
}
