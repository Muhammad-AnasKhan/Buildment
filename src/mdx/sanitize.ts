import "server-only";

// The single choke point between Block.config (server) and what the reader
// route sends to the client — see docs/09-security.mdx "The sanitizer contract".
//
// Deliberately generic (deep key-strip, not a per-block-type switch): a new
// block type is safe by construction the moment its config schema is added,
// instead of silently leaking until someone remembers to special-case it here.
const SECRET_KEYS = new Set([
  "correct",
  "correctOptionIds",
  "rubric",
  "sampleAnswer",
  "hiddenTests",
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
