// What the chapter question endpoints return. The web app declares the same two shapes next to its panel.

export type ChapterQuestionStatus = {
  /** False when the feature is off or not set up; the reader hides the box. */
  available: boolean;
  /** Questions this learner has left today (UTC). */
  remaining: number;
  dailyLimit: number;
  /** The course's own starter questions (course.yaml assistant.starters); empty when it sets none. */
  starters: string[];
};

export type ChapterQuestionAnswer = {
  answer: string;
  remaining: number;
  dailyLimit: number;
};
