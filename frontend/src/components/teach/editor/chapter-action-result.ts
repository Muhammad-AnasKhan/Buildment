export type ChapterActionFailure = { ok: false; errors: string[] };

/** Server Action transport can reject before a structured API result arrives. */
export async function safelyRunChapterAction<T>(action: () => Promise<T>): Promise<T | ChapterActionFailure> {
  try {
    return await action();
  } catch {
    return { ok: false, errors: ["Could not reach the server. Your changes are still in this editor. Try again."] };
  }
}
