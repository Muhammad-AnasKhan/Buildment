// Commit story as a pure model: two histories of the same work, for example
// one dump commit against a series of small, meaningful commits. The learner
// switches between them and taps a commit to read what a reviewer would see:
// its message, its size and what it tells them. No React here.

export type StoryCommit = {
  id: string;
  /** The commit message's first line, at most about 52 characters. */
  message: string;
  /** Day number in the project (1 = first day). Used to place the dot. */
  day: number;
  /** Files changed. */
  files: number;
  /** Lines added. */
  added: number;
  /** Lines removed. */
  removed: number;
  /** What a reviewer learns from this commit, at most about 110 characters. */
  note: string;
};

export type CommitHistory = {
  id: string;
  /** Tab label, at most about 14 characters ("One dump"). */
  label: string;
  /** In day order. One to twelve commits. */
  commits: StoryCommit[];
  /** The verdict for this history, at most about 40 characters ("A reviewer can follow every step"). */
  verdict: string;
  tone: "good" | "warn" | "bad";
};

export type CommitStoryConfig = {
  /** Exactly two histories of the same work. */
  histories: [CommitHistory, CommitHistory];
  /** The one line under the picture telling the learner what to do. */
  hint: string;
};

export type HistoryStats = {
  commits: number;
  totalLines: number;
  largestLines: number;
  days: number;
};

/** Counts for a history: commits, lines changed (added plus removed), the largest commit and the span of days. */
export function historyStats(history: CommitHistory): HistoryStats {
  const lines = history.commits.map(commitLines);
  const days = history.commits.map((c) => c.day);
  return {
    commits: history.commits.length,
    totalLines: lines.reduce((a, b) => a + b, 0),
    largestLines: lines.reduce((a, b) => Math.max(a, b), 0),
    days: days.length === 0 ? 0 : Math.max(...days) - Math.min(...days) + 1,
  };
}

/** Lines changed by one commit: added plus removed. */
export function commitLines(commit: StoryCommit): number {
  return commit.added + commit.removed;
}

export const DOT_MIN_R = 6;
export const DOT_MAX_R = 26;
/** Lines at which a dot reaches its full size; anything larger is clamped. */
const DOT_FULL_AT = 2000;

/** Dot radius in picture units: grows with the square root of lines changed, clamped to 6..26. */
export function dotRadius(lines: number): number {
  const t = Math.min(1, Math.sqrt(Math.max(0, lines) / DOT_FULL_AT));
  return DOT_MIN_R + (DOT_MAX_R - DOT_MIN_R) * t;
}

/**
 * Horizontal place of each commit's dot between `left` and `right`, by day on the shared range
 * `dayMin`..`dayMax`. Dots on the same or nearby days are pushed apart so they never overlap,
 * then the whole row is shifted back inside the range if the push ran past `right`.
 */
export function dotPositions(commits: StoryCommit[], dayMin: number, dayMax: number, left: number, right: number): number[] {
  const radii = commits.map((c) => dotRadius(commitLines(c)));
  const span = dayMax - dayMin;
  const xs = commits.map((c) => (span <= 0 ? (left + right) / 2 : left + ((c.day - dayMin) / span) * (right - left)));
  const GAP = 5;
  for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + radii[i - 1] + radii[i] + GAP);
  for (let i = xs.length - 1; i >= 0; i--) {
    const limit = i === xs.length - 1 ? right : xs[i + 1] - radii[i] - radii[i + 1] - GAP;
    if (xs[i] > limit) xs[i] = limit;
  }
  // A row too crowded to fit overlaps a little rather than leaving the picture.
  return xs.map((x) => Math.max(left, Math.min(right, x)));
}

/** Problems with the data: not two histories, duplicate ids, days out of order, negative counts. Empty when fine. */
export function checkCommitStory(config: CommitStoryConfig): string[] {
  const problems: string[] = [];
  const histories = config.histories as CommitHistory[];
  if (histories.length !== 2) problems.push(`${histories.length} histories, need exactly 2`);
  const historyIds = new Set<string>();
  for (const h of histories) {
    if (historyIds.has(h.id)) problems.push(`history ${h.id}: duplicate id`);
    historyIds.add(h.id);
    if (h.commits.length < 1 || h.commits.length > 12) problems.push(`history ${h.id}: ${h.commits.length} commits, need 1 to 12`);
    if (!h.label.trim()) problems.push(`history ${h.id}: empty label`);
    if (!h.verdict.trim()) problems.push(`history ${h.id}: empty verdict`);
    const seen = new Set<string>();
    let prevDay = -Infinity;
    for (const c of h.commits) {
      const at = `history ${h.id}, commit ${c.id}`;
      if (seen.has(c.id)) problems.push(`${at}: duplicate id`);
      seen.add(c.id);
      if (!c.message.trim()) problems.push(`${at}: empty message`);
      if (!c.note.trim()) problems.push(`${at}: empty note`);
      if (!Number.isFinite(c.day) || c.day < 1) problems.push(`${at}: day ${c.day} is not 1 or more`);
      else if (c.day < prevDay) problems.push(`${at}: day ${c.day} is before the previous commit`);
      prevDay = Math.max(prevDay, c.day);
      for (const [name, n] of [["files", c.files], ["added", c.added], ["removed", c.removed]] as const) {
        if (!Number.isFinite(n) || n < 0) problems.push(`${at}: ${name} is ${n}, need 0 or more`);
      }
    }
  }
  return problems;
}
