import {
  BookOpenCheck,
  ChartNoAxesCombined,
  CircleCheck,
  Database,
  Flame,
  FileText,
  GraduationCap,
  KeyRound,
  MessageCircle,
  MessageSquareText,
  Package,
  Paperclip,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

// Landing-page copy lives here so the layout components stay content-free.

/** Colour family of a feature icon (the only coloured element; the theme is black & white). */
export type Tone =
  | "indigo"
  | "sky"
  | "emerald"
  | "amber"
  | "violet"
  | "orange"
  | "rose";

/** How the right-hand side of a preview row is drawn. */
export type RowStatus =
  | { kind: "done" | "progress" | "next" | "answered"; text: string }
  | { kind: "time"; text: string }
  | { kind: "ratio"; value: number; total: number }
  | { kind: "count"; value: number }
  | { kind: "streak"; days: number };

export type FeatureRow = {
  icon: LucideIcon;
  label: string;
  /** Colour of this row's icon tile. */
  tone: Tone;
  status?: RowStatus;
};

export type ValueProp = {
  icon: LucideIcon;
  title: string;
  text: string;
  /** Colour of the tab, the panel glow and the panel's header icon. */
  tone: Tone;
  /** Heading of the animated preview panel shown when this tab is selected. */
  panelTitle: string;
  /** Rows that pop into the preview panel one after another. */
  rows: readonly FeatureRow[];
};

export const VALUE_PROPS: readonly ValueProp[] = [
  {
    icon: BookOpenCheck,
    title: "One project per course",
    text: "Every chapter moves the same codebase forward instead of isolated tutorials.",
    tone: "indigo",
    panelTitle: "Your project grows chapter by chapter",
    rows: [
      {
        icon: Package,
        label: "Project skeleton",
        tone: "amber",
        status: { kind: "done", text: "Done" },
      },
      {
        icon: Database,
        label: "Database design",
        tone: "sky",
        status: { kind: "done", text: "Done" },
      },
      {
        icon: KeyRound,
        label: "Authentication",
        tone: "violet",
        status: { kind: "progress", text: "In progress" },
      },
      {
        icon: ShoppingCart,
        label: "Multi-vendor cart",
        tone: "emerald",
        status: { kind: "next", text: "Up next" },
      },
    ],
  },
  {
    icon: MessageSquareText,
    title: "Help in context",
    text: "Questions and mentor replies stay tied to the course and chapter you are on.",
    tone: "sky",
    panelTitle: "Ask where you’re stuck",
    rows: [
      {
        icon: MessageCircle,
        label: "“Why HttpOnly and not localStorage?”",
        tone: "sky",
        status: { kind: "answered", text: "Answered" },
      },
      {
        icon: GraduationCap,
        label: "Mentor: because scripts can’t read it",
        tone: "violet",
        status: { kind: "time", text: "2 min ago" },
      },
      {
        icon: Paperclip,
        label: "Linked to Authentication › Chapter 3",
        tone: "indigo",
      },
    ],
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress you can see",
    text: "Completion, reviews, and activity show what is done and what needs attention.",
    tone: "emerald",
    panelTitle: "Know what’s done and what needs attention",
    rows: [
      {
        icon: CircleCheck,
        label: "Chapters completed",
        tone: "emerald",
        status: { kind: "ratio", value: 142, total: 379 },
      },
      {
        icon: FileText,
        label: "Reviews waiting",
        tone: "amber",
        status: { kind: "count", value: 3 },
      },
      {
        icon: Flame,
        label: "Learning streak",
        tone: "orange",
        status: { kind: "streak", days: 6 },
      },
    ],
  },
];

export type Step = {
  title: string;
  text: string;
  /** Small pill shown under the text of the active step. */
  badge: string;
  /** Title in the stage window's top bar. */
  stage: string;
};

export const STEPS: readonly Step[] = [
  {
    title: "Choose a course",
    text: "Browse published project courses and sign in to enroll.",
    badge: "Takes 2 minutes",
    stage: "Course picker",
  },
  {
    title: "Work through chapters",
    text: "Read lessons, complete exercises, and submit answers at each step.",
    badge: "Self-paced",
    stage: "Chapter checklist",
  },
  {
    title: "Ship the project",
    text: "Finish with a working product and a clear record of what you built.",
    badge: "Portfolio-ready",
    stage: "Deploy log",
  },
];

export type LessonModule = {
  name: string;
  question: string;
  hint: string;
  example: string;
  feedback: string;
};

/** Modules of the interactive lesson preview in the hero. */
export const LESSON_MODULES: readonly LessonModule[] = [
  {
    name: "Project skeleton",
    question: "Why keep the API and web app in one repository?",
    hint: "Think about versioning and shared types.",
    example:
      "A monorepo lets both apps share types and ship together, so one pull request can change the API and the UI without version drift.",
    feedback:
      "Good call on shared types. Next, mention how CI can run only the packages that changed.",
  },
  {
    name: "Database design",
    question: "Why store a price snapshot on each order item?",
    hint: "What happens when a vendor edits a price later?",
    example:
      "Prices change over time. A snapshot keeps past orders accurate, so receipts and refunds always match what the buyer paid.",
    feedback: "Exactly right. Receipts must never change after checkout.",
  },
  {
    name: "Authentication",
    question: "Where should the session token live after login?",
    hint: "Explain the choice and the security boundary it creates.",
    example:
      "An HttpOnly cookie on the API domain keeps the token outside client-side JavaScript while allowing the browser to send it.",
    feedback:
      "Clear reasoning. Bonus: add SameSite and Secure flags to reduce CSRF risk.",
  },
  {
    name: "Authorization",
    question: "How do you stop one vendor from editing another’s products?",
    hint: "Name the check and where it runs.",
    example:
      "Check on the server that product.vendorId matches the signed-in vendor before every update, never only in the UI.",
    feedback: "Server-side ownership checks are the right layer. Well done.",
  },
];
