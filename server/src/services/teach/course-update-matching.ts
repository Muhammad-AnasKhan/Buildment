import type { ImportPlan } from "./course-import.js";
import type { CourseUpdateModuleDiff, CourseUpdateChapterDiff } from "../../shared/api/teach.js";

export type IncomingLesson = ImportPlan["modules"][number]["lessons"][number];
export type ExistingChapter = {
  id: string; moduleId: string | null; title: string; slug: string; order: number;
  source: string; summary: string | null; estimatedMinutes: number | null;
  compiled?: string | null; publishedAt?: Date | string | null;
  readerMode: string; isMilestone: boolean; archivedAt: Date | string | null;
  blocks: { id: string; type: string; config: unknown; required: boolean; archivedAt: Date | string | null }[];
};
export type ExistingModule = { id: string; title: string; order: number; archivedAt: Date | string | null };
export type UpdateMapping = { moduleId: string | null; chapters: { chapterId: string | null; similarity: number | null; reason: string }[] }[];

export function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item) => item && typeof item === "object" && !Array.isArray(item)
    ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
}

function normalizedText(value: string) {
  return value.replace(/\bid\s*=\s*["'][^"']+["']/g, 'id="activity"')
    .replace(/\b[0-9A-HJKMNP-TV-Z]{26}\b/g, "activity")
    .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function shingles(value: string) {
  const words = normalizedText(value).split(/\s+/).filter(Boolean);
  return new Set(words.length < 2 ? words : words.slice(1).map((word, i) => `${words[i]} ${word}`));
}

/** Sørensen–Dice bigram similarity. Ignores generated activity IDs, never module position. */
export function textSimilarity(a: string, b: string): number {
  const left = shingles(a), right = shingles(b);
  return dice(left, right);
}

function dice(left: Set<string>, right: Set<string>) {
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const token of left) if (right.has(token)) common++;
  return 2 * common / (left.size + right.size);
}

function contentText(lesson: Pick<IncomingLesson, "source" | "blocks"> | ExistingChapter) {
  const blocks = lesson.blocks.filter(block => !("archivedAt" in block) || !block.archivedAt);
  return `${lesson.source}\n${blocks.map(block => `${block.type} ${canonical(block.config)}`).join("\n")}`;
}

function comparableSource(lesson: Pick<IncomingLesson, "source" | "blocks"> | ExistingChapter) {
  let source = lesson.source;
  for (const block of lesson.blocks) source = source.replaceAll(block.id, "activity");
  return source.replace(/\r\n/g, "\n").trim();
}

export function chapterSimilarity(incoming: IncomingLesson, old: ExistingChapter): number {
  return preparedSimilarity(prepare(incoming), prepare(old));
}

function prepare(lesson: IncomingLesson | ExistingChapter) {
  return { readerMode: lesson.readerMode, content: shingles(contentText(lesson)), title: shingles(lesson.title) };
}

function preparedSimilarity(incoming: ReturnType<typeof prepare>, old: ReturnType<typeof prepare>) {
  if (incoming.readerMode !== old.readerMode) return 0;
  const content = dice(incoming.content, old.content);
  const title = dice(incoming.title, old.title);
  // A title or old file path alone cannot establish identity after a rewrite.
  return content < 0.72 ? 0 : Math.round((content * 0.9 + title * 0.1) * 1000) / 1000;
}

/** Course-wide, one-to-one matching; ties on either side are deliberately left unmatched. */
export function matchCourseUpdate(plan: ImportPlan, modules: ExistingModule[], chapters: ExistingChapter[]) {
  const incoming = plan.modules.flatMap((module, mi) => module.lessons.map((lesson, li) => ({ lesson, mi, li })));
  // Build the similarity index once instead of retokenizing long chapters for each comparison.
  const existingIndex = chapters.map(prepare);
  const scores = incoming.map(({ lesson }) => {
    const prepared = prepare(lesson);
    return existingIndex.map(old => preparedSimilarity(prepared, old));
  });
  const mapping: UpdateMapping = plan.modules.map(module => ({ moduleId: null, chapters: module.lessons.map(() => ({ chapterId: null, similarity: null, reason: "New or ambiguous content; previous learner history is retained separately." })) }));
  for (const [i, item] of incoming.entries()) {
    const ranked = scores[i].map((score, index) => ({ score, index })).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    mapping[item.mi].chapters[item.li].similarity = best?.score ?? 0;
    if (!best || best.score < 0.8 || best.score - (ranked[1]?.score ?? 0) < 0.08) continue;
    const competitors = scores.map((row, index) => ({ score: row[best.index], index })).sort((a, b) => b.score - a.score);
    if (competitors[0].index !== i || best.score - (competitors[1]?.score ?? 0) < 0.08) continue;
    mapping[item.mi].chapters[item.li] = { chapterId: chapters[best.index].id, similarity: best.score,
      reason: best.score >= 0.99 ? "Matching content across the course." : "Unique content similarity match across the course." };
  }
  // Match module names first, then chapter membership for renamed modules. Require mutual uniqueness.
  const moduleScores = plan.modules.map((module, mi) => modules.map(old => {
    const oldIds = new Set(chapters.filter(c => c.moduleId === old.id).map(c => c.id));
    const matched = mapping[mi].chapters.filter(c => c.chapterId && oldIds.has(c.chapterId)).length;
    const overlap = matched ? 2 * matched / (module.lessons.length + oldIds.size) : 0;
    // A whole chapter can move out of a named module; membership must not steal that module's identity.
    return normalizedText(module.title) === normalizedText(old.title) ? 3 + overlap : overlap;
  }));
  for (let mi = 0; mi < plan.modules.length; mi++) {
    const ranked = moduleScores[mi].map((score, index) => ({ score, index })).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best || best.score < 0.5 || best.score - (ranked[1]?.score ?? 0) < 0.1) continue;
    const competitors = moduleScores.map((row, index) => ({ score: row[best.index], index })).sort((a, b) => b.score - a.score);
    if (competitors[0].index === mi && best.score - (competitors[1]?.score ?? 0) >= 0.1) mapping[mi].moduleId = modules[best.index].id;
  }
  const moduleById = new Map(modules.map(m => [m.id, m]));
  const chapterById = new Map(chapters.map(c => [c.id, c]));
  const usedChapters = new Set(mapping.flatMap(m => m.chapters.map(c => c.chapterId).filter(Boolean)));
  const usedModules = new Set(mapping.map(m => m.moduleId).filter(Boolean));
  const diff: CourseUpdateModuleDiff[] = plan.modules.map((module, mi) => {
    const match = mapping[mi], old = match.moduleId ? moduleById.get(match.moduleId) : undefined;
    const chapterDiffs: CourseUpdateChapterDiff[] = module.lessons.map((lesson, li) => {
      const matched = match.chapters[li], previous = matched.chapterId ? chapterById.get(matched.chapterId) : undefined;
      const changes: string[] = [];
      if (previous) {
        if (previous.title !== lesson.title) changes.push("Title");
        if (comparableSource(previous) !== comparableSource(lesson) ||
            canonical(previous.blocks.filter(b => !b.archivedAt).map(b => [b.type, b.config, b.required])) !== canonical(lesson.blocks.map(b => [b.type, b.config, b.required]))) changes.push("Content or activities");
        if (previous.order !== lesson.lessonNum) changes.push("Order");
        if (previous.summary !== lesson.summary || previous.estimatedMinutes !== lesson.estimatedMinutes || previous.isMilestone !== lesson.isMilestone || previous.readerMode !== lesson.readerMode) changes.push("Lesson settings");
        if (previous.compiled && comparableSource({ ...previous, source: previous.compiled }) !== comparableSource(lesson)) changes.push("Published content");
        if (previous.publishedAt === null) changes.push("Unpublished chapter");
      }
      const moved = previous && previous.moduleId !== match.moduleId;
      return { title: lesson.title, previousTitle: previous?.title, previousModule: previous?.moduleId ? moduleById.get(previous.moduleId)?.title : undefined,
        action: !previous ? "added" : previous.archivedAt ? "restored" : moved ? "moved" : changes.length ? "changed" : "unchanged",
        similarity: matched.similarity, reason: matched.reason, changes };
    });
    for (const chapter of chapters.filter(c => c.moduleId === old?.id && !c.archivedAt)) {
      if (!usedChapters.has(chapter.id)) chapterDiffs.push({ title: chapter.title, action: "removed", similarity: null, reason: "Missing from ZIP; archived with learner history retained.", changes: [] });
      else {
        const dest = mapping.findIndex(m => m.chapters.some(c => c.chapterId === chapter.id));
        if (dest !== mi) chapterDiffs.push({ title: chapter.title, action: "moved", destinationModule: plan.modules[dest].title, similarity: null, reason: "Moved out of this module; learner progress retained.", changes: [] });
      }
    }
    return { title: module.title, previousTitle: old?.title, previousOrder: old?.order, order: mi + 1,
      action: !old ? "added" : old.archivedAt ? "restored" : old.title !== module.title || old.order !== mi + 1 || chapterDiffs.some(c => c.action !== "unchanged") ? "changed" : "unchanged", chapters: chapterDiffs };
  });
  for (const module of modules.filter(m => !m.archivedAt && !usedModules.has(m.id))) {
    diff.push({ title: module.title, previousOrder: module.order, action: "removed", chapters: chapters.filter(c => c.moduleId === module.id && !c.archivedAt).map(c => {
      const dest = mapping.findIndex(m => m.chapters.some(match => match.chapterId === c.id));
      return { title: c.title, action: dest < 0 ? "removed" : "moved", destinationModule: dest < 0 ? undefined : plan.modules[dest].title, similarity: null,
        reason: dest < 0 ? "Archived; learner history retained." : "Moved to another module; learner progress retained.", changes: [] };
    }) });
  }
  const loose = chapters.filter(c => c.moduleId === null && !c.archivedAt && !usedChapters.has(c.id));
  if (loose.length) diff.push({ title: "Chapters without a module", action: "removed", chapters: loose.map(c => ({ title: c.title, action: "removed", similarity: null, reason: "Archived; learner history retained.", changes: [] })) });
  return { mapping, modules: diff };
}
