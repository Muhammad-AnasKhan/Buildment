const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/** User-submitted evidence links must be ordinary web URLs. */
export function parseSafeSubmissionUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol === "https:") return url;
    if (url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname)) return url;
    return null;
  } catch {
    return null;
  }
}

export function isSafeSubmissionUrl(value: string): boolean {
  return parseSafeSubmissionUrl(value) !== null;
}
