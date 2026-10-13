// Syllabus view model shared by the continue-chapter endpoint and (later) the
// course overview API. Mirrors frontend/src/components/learn/course-syllabus.tsx.

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
