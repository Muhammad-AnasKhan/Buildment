export type CourseBuilderChapter = {
  id: string;
  title: string;
  slug: string;
  order: number;
  publishedAt: Date | null;
  estimatedMinutes: number | null;
  isMilestone: boolean;
  readerMode: "DEFAULT" | "QUIZ";
  blocks: Array<{ type: string }>;
};

export type CourseBuilderModule = {
  id: string;
  title: string;
  order: number;
  chapters: CourseBuilderChapter[];
};

export type CourseBuilderCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  projectGoal: string | null;
  difficulty: string | null;
  estimatedHours: number | null;
  sequential: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  enrollmentCount: number;
  modules: CourseBuilderModule[];
};
