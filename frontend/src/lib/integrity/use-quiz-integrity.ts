"use client";
import { useQuizIntegrity as useSharedIntegrity } from '@buildment/learning-ui/lib/integrity/use-quiz-integrity';
import { apiFetch } from '../api-client';
export { requestQuizFullscreen } from '@buildment/learning-ui/lib/integrity/use-quiz-integrity';
export type { IntegrityTransport, IntegrityNotice, QuizIntegrity } from '@buildment/learning-ui/lib/integrity/use-quiz-integrity';
const transport = { apiFetch, fetch: (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args) };
export function useQuizIntegrity(options: Omit<Parameters<typeof useSharedIntegrity>[0], 'transport'>) {
  return useSharedIntegrity({ ...options, transport });
}
