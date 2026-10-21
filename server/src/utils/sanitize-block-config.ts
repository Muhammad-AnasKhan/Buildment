import { hasContentTokens } from "../shared/lib/content-tokens.js";

// The single choke point between Block.config (server) and what the reader
// route sends to the client — see docs/09-security.mdx "The sanitizer contract".
//
// Deliberately generic (deep key-strip, not a per-block-type switch): a new
// block type is safe by construction the moment its config schema is added,
// instead of silently leaking until someone remembers to special-case it here.
export const SECRET_KEYS: ReadonlySet<string> = new Set([
  "correct",
  "correctOptionId",
  "correctOptionIds",
  "rubric",
  "sampleAnswer",
  "hiddenTests",
  "tests",
  "solution",
]);

// TSafe defaults to TFull for callers that don't have (or don't need) a
// narrower client-facing type; pass it explicitly to get compile-time
// protection against accidentally reading a secret key back out.
export function sanitizeBlockConfig<TFull, TSafe = TFull>(config: TFull): TSafe {
  return stripSecrets(config) as TSafe;
}

function stripSecrets(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripSecrets);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !SECRET_KEYS.has(key))
        .map(([key, val]) => [key, stripSecrets(val)])
    );
  }
  return value;
}

/**
 * Paths of secret fields that hold a %%placeholder%%. Grading must never depend
 * on a learner's variant, so publish and import reject any of these.
 */
export function secretFieldsWithTokens(config: unknown, path = ""): string[] {
  if (Array.isArray(config)) return config.flatMap((item, index) => secretFieldsWithTokens(item, `${path}[${index}]`));
  if (!config || typeof config !== "object") return [];
  return Object.entries(config as Record<string, unknown>).flatMap(([key, val]) => {
    const here = path ? `${path}.${key}` : key;
    if (SECRET_KEYS.has(key)) return containsToken(val) ? [here] : [];
    return secretFieldsWithTokens(val, here);
  });
}

function containsToken(value: unknown): boolean {
  if (typeof value === "string") return hasContentTokens(value);
  if (Array.isArray(value)) return value.some(containsToken);
  if (value && typeof value === "object") return Object.values(value).some(containsToken);
  return false;
}
