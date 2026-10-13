// Syllabus view model shared by the course overview, progress and reader screens.

export type SyllabusChapter = {
  id: string;
  slug: string;
  title: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  blockCount: number;
  blocksCompleted?: number;
  locked?: boolean;
  unlocksAfter?: string | null;
};

export type SyllabusModule = {
  id: string;
  order: number;
  title: string;
  chapters: SyllabusChapter[];
  completedCount: number;
};
