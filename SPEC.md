# Interactive Project-Based LMS — Product & Technical Specification

**Status:** Draft v1 — 2026-08-01
**Working name:** adv-lms

---

## 1. What we are building

A learning platform where a **mentor** publishes a **project-based course** and assigns it to **mentees**. Unlike a video-course platform, the unit of learning here is a *chapter of interactive content*: prose written in Markdown, interrupted by blocks the learner must actively engage with before moving on.

The core bet: **passive reading does not teach; forced interaction does.** So every chapter is a mix of explanation and checkpoints — quizzes, MCQ tests, required reading acknowledgements, open-ended written answers, and runnable code. The platform tracks every one of those interactions and turns them into reports the mentor can act on.

### Non-goals for v1
- Video hosting / streaming (link out to YouTube/Loom if needed).
- Live classes, scheduling, calendars.
- Payments, marketplace, public course catalog.
- Mobile apps (responsive web only).
- Certificates, gamification, leaderboards.

### The one-sentence pitch
> A mentor writes a course in Markdown, drops in interactive blocks, assigns it to their students, and gets a live dashboard of exactly who understood what.

---

## 2. Users and roles

| Role | What they do |
|---|---|
| **Mentor** (author + instructor) | Creates courses, writes chapters, defines interactive blocks, assigns courses to mentees, reviews open-ended answers, reads reports. |
| **Mentee** (learner) | Enrolls / is assigned, reads chapters, answers blocks, runs code, submits work, sees own progress. |
| **Admin** | Manages users, promotes mentors, sees platform-wide data. Thin role in v1 — can be a superset of mentor. |

Roles are per-user global for v1 (`role: MENTOR | MENTEE | ADMIN`). A user can be a mentor on one course and a mentee on another later; the data model allows it (`Enrollment` is what makes you a mentee of a course), but the UI in v1 keeps the two experiences separate.

---

## 3. Domain model — the vocabulary

Getting these words fixed now prevents a lot of churn later.

- **Course** — the top-level container. Has a title, description, cover, difficulty, estimated hours, and a publish state. Owned by one mentor.
- **Module** *(optional grouping)* — an ordered section of a course ("Part 1: Foundations"). A course with no modules is fine; chapters can hang directly off the course. Keep this in the schema from day one, hide it in the UI until needed.
- **Chapter** — the atom of learning. One page of MDX content. Ordered within its module/course. Has a completion rule (see §6).
- **Block** — an interactive element inside a chapter's MDX. Six types in v1 (§5). Each block has a stable `id` and lives in the DB alongside the chapter so answers can reference it.
- **Project** — the spine of the course. A project-based course states an outcome ("build a multi-vendor marketplace"); chapters build toward it. In v1 a project is metadata on the course plus optionally-flagged **milestone chapters**. We are *not* building a separate submission system in v1 — a milestone is a chapter whose blocks happen to be heavier (code + long-form answer).
- **Enrollment** — the link between a mentee and a course. Created when a mentor assigns, or when a mentee joins via invite link.
- **Attempt / Response** — a mentee's answer to a block. Immutable rows, append-only; the latest one is "current". This gives free history for reports.
- **Progress** — derived state. Per block → per chapter → per course. We store it denormalized for read speed (§6).
- **Review** — a mentor's grade + feedback on a response that needs human judgement (open questions, and code submissions without auto-checks).

### Entity relationships

```
User ──< Course (as mentor)
Course ──< Module ──< Chapter ──< Block
Course ──< Enrollment >── User (as mentee)
Enrollment ──< ChapterProgress
Block ──< Response >── User
Response ──< Review >── User (as mentor)
```

---

## 4. Content authoring

**Format:** MDX — Markdown with our custom React components.
**Where it lives:** in Postgres (`Chapter.source` holds the raw MDX string). Not in git. Mentors are not expected to know git.
**Editor:** an in-app editor with two panes — raw MDX on the left, live preview on the right — plus a "/" command palette that inserts a block skeleton at the cursor. Autosave as draft; explicit publish.

### Why MDX and not a JSON block editor (Notion-style)
- Mentors writing technical courses already think in Markdown.
- Copy-paste from README/docs just works.
- Custom components give us arbitrary interactivity without building a block editor from scratch.
- Trade-off accepted: a raw-text editor is less friendly than drag-and-drop. Mitigation is the insert palette + live preview + inline validation errors.

### Rendering pipeline
1. Mentor saves MDX → server **parses and validates** it (§4.1) → stores `source` + extracted block metadata.
2. On publish, server compiles MDX to a serialized form and caches it (`Chapter.compiled`). Compilation at publish time, not request time.
3. Reader route renders the compiled output with our component map. Only components in the allowlist are available — **no arbitrary JSX/JS execution from author input**. Compilation runs server-side in a restricted MDX config with raw HTML disabled.

### 4.1 Block extraction and the sync problem

The hard part of MDX + interactivity: the answers live in the DB, the questions live in a text blob. If a mentor edits a question after students answered it, what happens?

Rules:
- Every block in MDX carries an explicit `id` (auto-inserted by the editor, ULID). The `id` is the join key to `Block` rows.
- On save, the server diffs blocks in the source against `Block` rows:
  - **New id** → create `Block`.
  - **Missing id** → soft-delete `Block` (`archivedAt`), keep responses for history.
  - **Existing id, content changed** → bump `Block.version`, keep the row.
- If a block with existing responses changes in a way that invalidates them (correct answer changes, options removed), the editor shows a warning and the mentor chooses: *keep existing responses* or *invalidate and require re-answer*.
- Correct answers, explanations, and rubrics are **never** part of the source sent to the client. They live in `Block.config` server-side only. The client receives a sanitized projection (§8.2).

---

## 5. The interactive blocks

Six block types in v1. Each is defined by: MDX authoring syntax, config schema (server), learner UI, completion rule, and what it contributes to reports.

Common shape — every block is an MDX component with an `id` and grading-relevant config passed as props at *author* time, stripped before reaching the client.

### 5.1 `<Quiz>` — inline knowledge check
A single question dropped between paragraphs. Lightweight, low-stakes, immediate feedback. This is the "did that paragraph land?" block.

```mdx
<Quiz id="01J8..." type="single">
  In a multi-vendor system, who owns the product inventory record?
  <Option correct>The vendor</Option>
  <Option>The platform</Option>
  <Option>The customer</Option>
  <Explanation>
    Vendors own their catalog. The platform owns the *order*, which may
    span multiple vendors' inventory.
  </Explanation>
</Quiz>
```

- Types: `single`, `multiple`, `true-false`.
- Auto-graded. Instant feedback with explanation revealed after submit.
- Config: `options[]`, `correctOptionIds[]`, `explanation`, `allowRetry` (default true), `shuffle` (default false).
- Completion: answered (correctness recorded but does not block by default).
- Reports: per-block correct rate; flags blocks where >50% of the cohort got it wrong ("confusing content" signal).

### 5.2 `<Test>` — MCQ assessment
A gated, multi-question assessment. Higher stakes than a quiz.

```mdx
<Test id="01J8..." passingScore={70} timeLimitMinutes={20} maxAttempts={3}>
  <Question id="q1" points={2}>
    Which failure mode is unique to multi-vendor checkout?
    <Option correct>Partial fulfillment across vendors</Option>
    <Option>Card decline</Option>
  </Question>
  <Question id="q2">...</Question>
</Test>
```

- Rendered as a distinct, focused surface (not inline prose) — one question at a time or all-at-once, mentor's choice.
- Config: `questions[]`, `passingScore`, `timeLimitMinutes?`, `maxAttempts`, `shuffleQuestions`, `showAnswersAfter: never | submit | pass`.
- Auto-graded on submit; server-side scoring only.
- **Blocking by default** — chapter not complete until passed.
- Timer is enforced server-side (attempt has `startedAt`; late submissions are marked but scored honestly, with a flag on the report). Client timer is advisory UI only.
- Reports: score, attempts used, per-question breakdown, time taken.

### 5.3 `<MustRead>` — required external reading
The mentee has to go read something and confirm it.

```mdx
<MustRead id="01J8..." url="https://stripe.com/docs/connect" minSeconds={60}>
  Stripe Connect — read the "Separate charges and transfers" section.
  <Checkpoint>I understand how funds are split between vendors.</Checkpoint>
</MustRead>
```

- Renders as a card: title, source, link (opens in new tab), and a checkbox.
- `minSeconds` — the checkbox stays disabled for N seconds after the link is opened. Honest-effort nudge, not enforcement. We are explicit with users that this is an honor system, not surveillance.
- Optional `<Checkpoint>` — the checkbox label becomes an attestation statement instead of "I read this".
- Optional `requireNote` — mentee must write one takeaway sentence, turning it into a light open question.
- Completion: checked (+ note submitted if required).
- Reports: read/unread, time-to-check, note content.

### 5.4 `<OpenQuestion>` — free-text answer, human-reviewed
The block that carries the most learning value and the most product risk (it needs a human in the loop).

```mdx
<OpenQuestion id="01J8..." minWords={80} rubric="Mentions vendor payouts, order splitting, and inventory ownership.">
  Explain how you would model an order that contains items from three
  different vendors. What happens if one vendor cancels?
</OpenQuestion>
```

- Markdown-capable textarea, autosaves a draft, explicit submit.
- Config: `minWords`, `maxWords?`, `rubric` (mentor-only), `sampleAnswer?` (revealed after submit or after review, mentor's choice).
- Completion: submitted. **Not** blocked on mentor review — the mentee keeps moving; review arrives asynchronously.
- Goes into the **mentor review queue** (§7).
- Reports: submitted / pending review / reviewed, mentor score and feedback.

### 5.5 `<CodeBlock>` — runnable code
Interactive editor + runtime + optional automated checks.

```mdx
<CodeBlock id="01J8..." runtime="node" template="node-basic" checks="hidden">
```js
// Implement splitOrder(items) -> Map<vendorId, Item[]>
export function splitOrder(items) {
  // your code here
}
```
</CodeBlock>
```

- Runtimes in v1: **JavaScript/TypeScript** (WebContainers or Sandpack) and **Python** (Pyodide). Both execute **in the learner's browser tab** — zero server compute, zero sandbox-escape risk to our infra, instant startup.
- Three modes:
  - `playground` — run it, no grading. Completion = ran once.
  - `checked` — mentor supplies test cases; they run in the same sandbox and the pass/fail result is posted to the server. Completion = tests pass.
  - `submit` — output/source is submitted for mentor review, like an open question.
- **Important limitation, stated openly:** since checks run client-side, results are *trusted client input* and can be forged by a determined learner. That is acceptable for a mentorship platform where the mentor knows the students. If a course needs tamper-proof grading, that's the server-runner upgrade in §12.
- Config: `runtime`, `mode`, `starterFiles`, `visibleTests`, `hiddenTests`, `timeoutMs`, `dependencies`.
- Reports: attempts, passed/failed, final source snapshot, time spent.

### 5.6 `<Callout>` / `<Steps>` / `<Diagram>` — non-interactive presentation
Not graded, but part of the component library: styled callouts (info/warn/tip), numbered step lists, and Mermaid diagrams. Cheap to build, big effect on how a course *feels*.

### Block registry
Each block type is declared once in a registry — `type`, Zod config schema, server grader, client component, report projector. Adding a seventh block type must mean touching exactly one registry entry plus its files, not fifteen switch statements. This is the single most important structural decision in the codebase.

---

## 6. Progress and completion

### Levels
1. **Block progress** — a `Response` exists for (user, block) and satisfies the block's completion rule.
2. **Chapter progress** — derived from its blocks + scroll/read state.
3. **Course progress** — derived from its chapters.

### Chapter completion rule
A chapter is complete when **all required blocks are complete**. Every block is required by default; a mentor can mark any block `optional`. Chapters with zero blocks complete on an explicit "Mark as read" button.

### Blocking / gating
Two independent switches per course:
- `sequentialChapters` (default **on**) — chapter N+1 is locked until chapter N is complete.
- Per-block `blocking` — `<Test>` defaults to blocking; everything else defaults to non-blocking. A blocking block prevents chapter completion, and therefore the next chapter, until satisfied.

Gating is enforced **server-side** on the chapter data route, not just hidden in the UI.

### Storage strategy
- `Response` — append-only source of truth, one row per submission attempt.
- `ChapterProgress` — denormalized per (enrollment, chapter): `status`, `completedBlocks`, `totalBlocks`, `score`, `startedAt`, `completedAt`, `timeSpentSeconds`.
- `Enrollment` — denormalized course rollup: `percentComplete`, `chaptersCompleted`, `lastActiveAt`, `status`.

Denormalized rows are recomputed inside the same transaction that writes a `Response`. Reports read only denormalized tables. A `recomputeProgress(enrollmentId)` job exists as the repair path — run it after content edits and as a nightly consistency check.

### Time tracking
Client sends heartbeats (every 15s while the tab is visible and focused) to a lightweight endpoint. Server accumulates into `ChapterProgress.timeSpentSeconds`, capped per session to reject a tab left open overnight. Approximate by design — used for "which chapter is taking people forever", not for billing.

---

## 7. Mentor review queue

The human-in-the-loop surface. If this is slow or annoying, mentors stop grading and the platform's value collapses — so it gets first-class treatment, not a form buried in a table.

**Queue view:** all pending items across the mentor's courses, filterable by course / mentee / block type / age. Sorted oldest-first by default. Shows an aging indicator (>48h waiting is highlighted).

**Review view:** one submission at a time, keyboard-driven.
- Left: the original question + the mentor's own rubric + reference answer.
- Right: the mentee's answer, rendered Markdown (or code with syntax highlighting + the run output they got).
- Actions: score (rubric-based or 1–5), written feedback (Markdown), and a verdict: **Approved** / **Needs revision**.
- `j`/`k` to move through the queue, `⌘+Enter` to submit and advance.
- Canned feedback snippets, saved per mentor, for repeated comments.

**Needs revision** reopens the block for the mentee, notifies them in-app, and puts the resubmission back at the front of the queue with the previous exchange threaded.

---

## 8. Reports

Three report surfaces. All read from denormalized tables; none run heavy aggregate queries on the read path.

### 8.1 Chapter report (mentor, one chapter × whole cohort)
Answers: *did this chapter work?*
- Completion rate, median time spent, drop-off point (last block reached by those who abandoned).
- Per-block table: attempts, correct rate, average score, pending reviews.
- **Confusion flags** — blocks where correct rate < 50% or average attempts > 2. This is the feature that makes the report actionable rather than decorative: it tells the mentor which paragraph to rewrite.
- Per-mentee row: status, score, time, outstanding items.

### 8.2 Course report (mentor, one course × whole cohort)
Answers: *how is the cohort doing overall?*
- Cohort funnel: enrolled → started → % through → completed.
- Chapter-by-chapter completion curve (where people stall).
- Mentee leaderboard-free table: name, % complete, average score, last active, items awaiting review, at-risk flag.
- **At-risk rule (v1):** no activity in 7 days, OR failed the same test twice, OR >3 chapters behind the cohort median. Surfaced as a list the mentor can act on, with a one-click nudge.

### 8.3 Mentee report (visible to both mentee and mentor)
Answers: *how am I doing?*
- Progress ring, current chapter, next action.
- Per-chapter timeline with scores.
- All mentor feedback in one place — this is what a learner actually wants to re-read.
- Weak areas: block topics/tags with lowest scores.

### Export
CSV export of any report table, and a per-mentee PDF summary. Cheap to add, disproportionately asked for.

---

## 9. Technical architecture

### Stack
- **Framework:** Next.js 15 (App Router), TypeScript strict, React Server Components by default.
- **DB:** Postgres (Supabase or Neon). **ORM:** Prisma.
- **Auth:** Auth.js (NextAuth) with email magic link + Google. Session in DB.
- **Styling:** Tailwind CSS + shadcn/ui + Radix primitives.
- **Content:** MDX via `next-mdx-remote` / `@mdx-js/mdx`, compiled server-side at publish.
- **Validation:** Zod, shared between client forms and server actions.
- **Code sandbox:** WebContainers (Node) + Pyodide (Python), loaded lazily per chapter.
- **Editor:** CodeMirror 6 (code blocks + MDX editor).
- **Background jobs:** Vercel Cron for nightly recompute; a queue is deferred (§12).
- **Email:** Resend (invites, review notifications, nudges).
- **File storage:** S3-compatible (Supabase Storage / R2) for course covers and attachments.
- **Analytics/errors:** PostHog + Sentry.
- **Testing:** Vitest (unit — graders, progress math), Playwright (E2E — the learner flow end to end).
- **Hosting:** Vercel.

### Why this stack
One repo, one deploy, server-side grading in the same codebase as the UI, and the best MDX story available. Prisma keeps the report queries typed and readable. The whole thing is deployable by one person on a free tier and scales to thousands of learners before anything needs rethinking.

### 9.1 Repository layout

```
adv-lms/
├─ docs/
│  └─ SPEC.md
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/                 # landing, pricing later
│  │  ├─ (auth)/login, /verify
│  │  ├─ (learn)/                     # MENTEE surfaces
│  │  │  ├─ dashboard/
│  │  │  ├─ courses/[courseSlug]/
│  │  │  │  ├─ page.tsx               # course overview / syllabus
│  │  │  │  └─ [chapterSlug]/page.tsx # the reader — the core screen
│  │  │  └─ progress/
│  │  ├─ (teach)/                     # MENTOR surfaces
│  │  │  ├─ courses/[courseId]/
│  │  │  │  ├─ edit/                  # course settings
│  │  │  │  ├─ chapters/[chapterId]/edit/   # MDX editor
│  │  │  │  ├─ mentees/               # assign + manage
│  │  │  │  └─ reports/               # course + chapter reports
│  │  │  └─ review/                   # the review queue
│  │  ├─ (admin)/
│  │  └─ api/
│  │     ├─ blocks/[blockId]/respond/route.ts
│  │     ├─ progress/heartbeat/route.ts
│  │     └─ webhooks/
│  ├─ blocks/                         # THE BLOCK REGISTRY
│  │  ├─ registry.ts
│  │  ├─ quiz/{schema,grade,Component,report}.ts(x)
│  │  ├─ test/
│  │  ├─ must-read/
│  │  ├─ open-question/
│  │  └─ code/
│  ├─ mdx/
│  │  ├─ compile.ts                   # server-side MDX -> compiled
│  │  ├─ extract.ts                   # source -> block metadata
│  │  ├─ sanitize.ts                  # strip answers for client
│  │  └─ components.tsx               # allowlisted component map
│  ├─ server/
│  │  ├─ auth/
│  │  ├─ db.ts
│  │  ├─ progress/{compute,gate}.ts
│  │  ├─ reports/{chapter,course,mentee}.ts
│  │  └─ actions/                     # server actions
│  ├─ components/ui/                  # shadcn
│  └─ lib/
├─ e2e/
└─ tests/
```

### 9.2 Data model (Prisma sketch)

```prisma
enum Role            { MENTEE MENTOR ADMIN }
enum CourseStatus    { DRAFT PUBLISHED ARCHIVED }
enum EnrollStatus    { ASSIGNED IN_PROGRESS COMPLETED DROPPED }
enum ProgressStatus  { NOT_STARTED IN_PROGRESS COMPLETED }
enum BlockType       { QUIZ TEST MUST_READ OPEN_QUESTION CODE }
enum ResponseStatus  { DRAFT SUBMITTED AUTO_GRADED PENDING_REVIEW REVIEWED NEEDS_REVISION }
enum ReviewVerdict   { APPROVED NEEDS_REVISION }

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  role          Role     @default(MENTEE)
  createdAt     DateTime @default(now())
  coursesOwned  Course[]     @relation("CourseMentor")
  enrollments   Enrollment[]
  responses     Response[]
  reviewsGiven  Review[]     @relation("Reviewer")
}

model Course {
  id            String       @id @default(cuid())
  slug          String       @unique
  title         String
  description   String?
  coverUrl      String?
  projectGoal   String?      // "Build a multi-vendor marketplace"
  difficulty    String?
  estimatedHours Int?
  status        CourseStatus @default(DRAFT)
  sequential    Boolean      @default(true)
  mentorId      String
  mentor        User         @relation("CourseMentor", fields: [mentorId], references: [id])
  modules       Module[]
  chapters      Chapter[]
  enrollments   Enrollment[]
  publishedAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  @@index([mentorId, status])
}

model Module {
  id        String    @id @default(cuid())
  courseId  String
  course    Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  title     String
  order     Int
  chapters  Chapter[]
  @@unique([courseId, order])
}

model Chapter {
  id          String   @id @default(cuid())
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  moduleId    String?
  module      Module?  @relation(fields: [moduleId], references: [id], onDelete: SetNull)
  slug        String
  title       String
  summary     String?
  order       Int
  source      String   @db.Text        // raw MDX (draft)
  compiled    String?  @db.Text        // compiled MDX at publish
  publishedAt DateTime?
  isMilestone Boolean  @default(false)
  blocks      Block[]
  progress    ChapterProgress[]
  @@unique([courseId, slug])
  @@index([courseId, order])
}

model Block {
  id          String    @id            // ULID authored into the MDX
  chapterId   String
  chapter     Chapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  type        BlockType
  order       Int
  version     Int       @default(1)
  required    Boolean   @default(true)
  blocking    Boolean   @default(false)
  points      Int       @default(1)
  config      Json                     // answers, rubric, tests — SERVER ONLY
  tags        String[]                 // for weak-area reporting
  archivedAt  DateTime?
  responses   Response[]
  @@index([chapterId, order])
}

model Enrollment {
  id                String       @id @default(cuid())
  courseId          String
  course            Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  userId            String
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  status            EnrollStatus @default(ASSIGNED)
  assignedById      String?
  percentComplete   Int          @default(0)
  chaptersCompleted Int          @default(0)
  totalScore        Int          @default(0)
  maxScore          Int          @default(0)
  lastActiveAt      DateTime?
  startedAt         DateTime?
  completedAt       DateTime?
  createdAt         DateTime     @default(now())
  chapterProgress   ChapterProgress[]
  @@unique([courseId, userId])
  @@index([userId, status])
}

model ChapterProgress {
  id              String         @id @default(cuid())
  enrollmentId    String
  enrollment      Enrollment     @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  chapterId       String
  chapter         Chapter        @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  status          ProgressStatus @default(NOT_STARTED)
  blocksCompleted Int            @default(0)
  blocksTotal     Int            @default(0)
  score           Int            @default(0)
  maxScore        Int            @default(0)
  timeSpentSeconds Int           @default(0)
  startedAt       DateTime?
  completedAt     DateTime?
  @@unique([enrollmentId, chapterId])
  @@index([chapterId, status])
}

model Response {
  id           String         @id @default(cuid())
  blockId      String
  block        Block          @relation(fields: [blockId], references: [id], onDelete: Cascade)
  userId       String
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  enrollmentId String
  attempt      Int            @default(1)
  status       ResponseStatus @default(SUBMITTED)
  payload      Json           // shape depends on block type
  score        Int?
  maxScore     Int?
  isCorrect    Boolean?
  durationMs   Int?
  startedAt    DateTime?
  submittedAt  DateTime       @default(now())
  review       Review?
  @@index([blockId, userId, attempt])
  @@index([enrollmentId])
  @@index([status])            // drives the review queue
}

model Review {
  id         String        @id @default(cuid())
  responseId String        @unique
  response   Response      @relation(fields: [responseId], references: [id], onDelete: Cascade)
  reviewerId String
  reviewer   User          @relation("Reviewer", fields: [reviewerId], references: [id])
  score      Int?
  feedback   String        @db.Text
  verdict    ReviewVerdict
  createdAt  DateTime      @default(now())
}
```

### 9.3 Response payload shapes

```ts
type ResponsePayload =
  | { type: 'QUIZ';          selected: string[] }
  | { type: 'TEST';          answers: Record<string, string[]>; startedAt: string }
  | { type: 'MUST_READ';     acknowledged: true; openedAt?: string; note?: string }
  | { type: 'OPEN_QUESTION'; text: string; wordCount: number }
  | { type: 'CODE';          files: Record<string,string>; stdout?: string;
                             checksPassed?: number; checksTotal?: number; ranAt: string }
```

### 9.4 Answer submission flow

1. Client POSTs to `/api/blocks/[blockId]/respond` with a typed payload.
2. Server: authenticate → verify enrollment → verify block belongs to an accessible chapter → verify gating allows it → verify attempt limits.
3. Look up `Block.config` (server-only) and run the type's grader from the registry.
4. In one transaction: insert `Response`, upsert `ChapterProgress`, recompute `Enrollment` rollup, enqueue a review row if the type needs one.
5. Return the sanitized result: score, correctness, explanation (if the block reveals it), and updated progress.

**Never** send `Block.config` to the client. The sanitizer in `mdx/sanitize.ts` produces the client projection and is covered by a test that fails if a `correct`, `rubric`, `sampleAnswer`, or `hiddenTests` key ever reaches the client payload.

---

## 10. Key screens (v1)

**Mentee**
1. Dashboard — assigned courses, next action, pending revisions.
2. Course overview — syllabus, progress, project goal, continue button.
3. **Chapter reader** — the core screen. Content + inline blocks, sticky progress bar, prev/next with gating, "N blocks remaining".
4. My progress — the mentee report (§8.3).

**Mentor**
5. Course list + create.
6. Course editor — settings, chapter list with drag-reorder, publish.
7. **Chapter MDX editor** — split-pane, insert palette, validation errors, publish/draft.
8. Mentees — assign by email/bulk, invite link, per-mentee drill-down.
9. **Review queue** (§7).
10. **Reports** — course report, chapter report (§8).

Build order for screens: 3 → 7 → 1/2 → 9 → 10 → 8 → the rest. The reader and the editor are the product; everything else is scaffolding around them.

---

## 11. Security and integrity

- **Answers server-side only.** Correct answers, rubrics, hidden tests never leave the server. Enforced by the sanitizer + a test.
- **Grading server-side only** for quiz/test. Client-reported code-check results are trusted by design and labeled as such in reports (§5.5).
- **Authorization on every route**: mentors can only touch their own courses; mentees only enrolled ones. Centralize in `server/auth/guards.ts` — no ad-hoc checks in route handlers.
- **Gating enforced server-side** — a locked chapter returns 403 from its data loader, not just a hidden link.
- **MDX is untrusted author input**: raw HTML disabled, component allowlist, no arbitrary imports, compiled in a restricted config. Mentors are semi-trusted, but a compromised mentor account must not become XSS against every student.
- **Rate limits** on submit endpoints (per user, per block) to stop brute-forcing MCQ answers; combine with `maxAttempts`.
- **Code sandbox** runs in the browser inside a cross-origin-isolated iframe; no access to app cookies or the parent DOM.
- **PII**: mentee answers are course-scoped; only the owning mentor and admins can read them. Deleting a user cascades responses.

---

## 12. Deliberately deferred (v2+)

Listed so we build v1 without painting into a corner:
- **Server-side code execution** (Docker/Firecracker or E2B) for tamper-proof grading and more languages. The `Block.config.runtime` field and `mode: checked` contract are designed so this is a runner swap, not a redesign.
- **Cohorts, deadlines, scheduled drip release, email nudges.** `Enrollment` already carries the fields a cohort would group on; add a `Cohort` model later.
- **Notifications** beyond in-app + transactional email.
- **AI-assisted review** — draft feedback on open answers for the mentor to edit. The `Review` model already separates score/feedback/verdict, so an AI draft is just a pre-filled form.
- **Git import/export of MDX bundles.**
- **Real project submissions** (repo links, deployed URLs, peer review).
- **Public catalog, payments, certificates, analytics for learners.**
- **Versioned course releases** so editing a live course doesn't affect in-flight learners.

---

## 13. Build plan

Each milestone ends with something demoable. No milestone is "just refactoring".

**M0 — Foundation (week 1)**
Next.js + TS + Tailwind + shadcn scaffold. Prisma schema above, migrated. Auth.js with magic link + Google. Role-gated layouts. Seed script with one mentor, three mentees, one course, three chapters.
*Demo: log in as mentor and as mentee, see different shells.*

**M1 — Content pipeline (week 2)**
MDX compile + component map + sanitizer. Block extraction and DB sync (§4.1). Chapter reader rendering static content. Mentor MDX editor with live preview.
*Demo: write a chapter in the editor, read it as a mentee.*

**M2 — Blocks, part 1 (week 3)**
Block registry. `<Quiz>`, `<MustRead>`, `<Callout>`. Submission API + graders. `Response` writes. Basic per-chapter progress.
*Demo: answer a quiz, get feedback, see progress move.*

**M3 — Progress and gating (week 4)**
Full progress computation, denormalized rollups, sequential gating enforced server-side, heartbeat time tracking, `<Test>` with attempts + server scoring + timer.
*Demo: get locked out of chapter 3 until the test is passed.*

**M4 — Open questions + review queue (week 5)**
`<OpenQuestion>`, review queue, review view with keyboard nav, needs-revision loop, in-app + email notification.
*Demo: mentee submits an answer, mentor reviews it, mentee sees feedback and resubmits.*

**M5 — Code runner (week 6)**
`<CodeBlock>` with CodeMirror, WebContainers (Node) and Pyodide (Python), playground/checked/submit modes, result submission, code in the review view.
*Demo: run and pass a coding exercise inside a chapter.*

**M6 — Reports (week 7)**
Chapter report, course report, mentee report, confusion flags, at-risk rule, CSV export.
*Demo: mentor sees which block confused the cohort.*

**M7 — Assignment + polish (week 8)**
Assign by email/bulk, invite links, course publish flow, empty states, mobile pass, Playwright E2E of the full learner journey, Sentry + PostHog.
*Demo: end-to-end — create course, assign, learn, review, report.*

Roughly 8 focused weeks for one developer. M1, M2, and M5 are the risky ones; M0, M6, M7 are predictable.

---

## 14. Decisions already made

| Decision | Choice | Why |
|---|---|---|
| Stack | Next.js + Postgres + Prisma | One deploy, best MDX story, typed reports |
| Content format | MDX in DB, web editor | Mentors need no git; copy-paste from docs works |
| Code execution | Client-side (WebContainers + Pyodide) | Zero infra, zero sandbox risk; server runner later |
| Grading | Server-side for quiz/test; client-reported for code | Integrity where it's cheap, pragmatism where it isn't |
| Progress | Append-only responses + denormalized rollups | Free history, fast reports |
| v1 scope | Core blocks + code runner + review queue | A functional loop end to end |
| Deferred | Cohorts, deadlines, notifications, server runner | Not needed to prove the loop works |

## 15. Open questions to resolve before M4

1. **Scoring model** — is a course score a percentage of points earned, or just completion? (Recommendation: track points, display completion; surface score only in reports.)
2. **Retakes** — should a passed test be retakeable to improve a score? (Recommendation: no in v1; keep first pass.)
3. **Mentor capacity** — what happens when a mentor has 200 pending reviews? (v1 answer: aging highlights + bulk approve; v2: AI-drafted feedback.)
4. **Course editing while students are mid-course** — v1 warns the mentor; v2 needs versioned releases.
5. **Multi-mentor courses / TAs** — not in v1. `Review.reviewerId` is already independent of `Course.mentorId`, so adding co-teachers later is an access-control change only.
