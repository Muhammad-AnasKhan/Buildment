// Local-path-only redirect validation — invite and login flows forward users
// back to a target URL after sign-in, and an unvalidated target is an open
// redirect. Only same-origin paths pass; protocol-relative (//evil.com),
// absolute URLs, and backslash tricks are rejected.

export function safeRedirectTo(raw: string | undefined | null): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  if (raw.includes("\\")) return undefined;
  return raw;
}
