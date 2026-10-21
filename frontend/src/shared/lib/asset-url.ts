// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
/**
 * Asset URLs may be same-origin paths (for course assets served from the web
 * app's public folder) or absolute HTTPS URLs. Protocol-relative URLs are
 * rejected because they can point at another origin.
 */
export function isSafeAssetUrl(value: string): boolean {
  if (value.startsWith("/")) {
    // Browsers treat a backslash after the first slash like a second slash,
    // which can turn a seemingly local path into an external URL.
    if (value.startsWith("//")) return false;
    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      if (code < 32 || code === 92 || code === 127) return false;
    }
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:");
  } catch {
    return false;
  }
}
