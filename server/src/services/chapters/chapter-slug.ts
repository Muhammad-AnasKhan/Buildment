/**
 * A chapter row's own slug can carry its release id ("1-1-set-the-scene--01m5w41ba4..."), while a
 * release names it "1-1-set-the-scene". Links built from rows (dashboard, activity, notifications,
 * emails) use the long form, so accept it and match the release chapter by that id.
 */
export function findChapterIndex(chapters: readonly { id: string; slug: string }[], chapterSlug: string): number {
  const exact = chapters.findIndex((c) => c.slug === chapterSlug);
  if (exact !== -1) return exact;
  const cut = chapterSlug.lastIndexOf("--");
  if (cut === -1) return -1;
  const id = chapterSlug.slice(cut + 2).toLowerCase();
  return chapters.findIndex((c) => c.id.toLowerCase() === id);
}
