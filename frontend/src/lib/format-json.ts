/** Pretty-print JSON strings for read-only display; pass through invalid JSON unchanged. */
export function formatJsonDisplay(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
