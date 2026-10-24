// 6.3 "Add new books while you page": a list of books, newest first, 3 per
// page. Page 1 (books 9, 8, 7) is taken first. Then the list changes by k:
// k = -1 deletes book 8; k = 0 changes nothing; k = 1, 2, 3 add books 10, 11,
// 12 at the top. Then page 2 is taken, by offset (rows 4 to 6 of the changed
// list) or by cursor (the 3 books older than book 7). Pure, no React.

export type PagingMode = "offset" | "cursor";
export type Change = -1 | 0 | 1 | 2 | 3;

export const CHANGES: readonly Change[] = [-1, 0, 1, 2, 3];
export const CHANGE_LABELS: Record<Change, string> = { "-1": "8 deleted", 0: "no change", 1: "+1", 2: "+2", 3: "+3" };
export const DEFAULT_CHANGE: Change = 1;
export const PAGE_SIZE = 3;
export const PAGE_ONE: readonly number[] = [9, 8, 7];
/** The most book rows the picture draws. */
export const VISIBLE_SLOTS = 8;
export const ALL_BOOKS: readonly number[] = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

/** The books in the changed list, newest first. */
export function changedList(k: Change): number[] {
  const out: number[] = [];
  for (let b = 9 + Math.max(0, k); b >= 1; b--) if (!(k === -1 && b === 8)) out.push(b);
  return out;
}

/** Page 2 as the API returns it. */
export function pageTwo(k: Change, mode: PagingMode): number[] {
  const list = changedList(k);
  if (mode === "offset") return list.slice(PAGE_SIZE, 2 * PAGE_SIZE);
  return list.filter((b) => b < 7).slice(0, PAGE_SIZE);
}

/** Row of a book in the picture: books keep their order and the list makes room at the top. A deleted book keeps its row as a ghost. */
export function slotOf(book: number, k: Change): number | null {
  if (book > 9) return book <= 9 + k ? 9 + Math.max(0, k) - book : null;
  return Math.max(0, k) + 9 - book;
}

export type BookView = {
  book: number;
  /** Row in the drawn column, 0 at the top; null when the book is not in the list yet. */
  slot: number | null;
  visible: boolean;
  isNew: boolean;
  deleted: boolean;
  onPageOne: boolean;
  onPageTwo: boolean;
  /** On page 2 and already shown on page 1. */
  again: boolean;
  /** Missing from page 2 and from page 1, though it sits between them. */
  skipped: boolean;
};

export type PagingState = {
  books: BookView[];
  pageTwo: number[];
  /** Rows covered by each bracket, first to last. */
  pageOneSlots: [number, number];
  pageTwoSlots: [number, number];
  repeated: number[];
  skipped: number[];
};

export function pagingState(k: Change, mode: PagingMode): PagingState {
  const page2 = pageTwo(k, mode);
  const newest2 = page2.length ? Math.max(...page2) : 0;
  const list = changedList(k);
  const skipped = list.filter((b) => b < 7 && b > newest2 && !page2.includes(b));
  const books: BookView[] = ALL_BOOKS.map((book) => {
    const slot = slotOf(book, k);
    const deleted = k === -1 && book === 8;
    const inList = list.includes(book);
    const onPageTwo = page2.includes(book);
    return {
      book,
      slot,
      visible: slot !== null && slot < VISIBLE_SLOTS && (inList || deleted),
      isNew: book > 9 && inList,
      deleted,
      onPageOne: PAGE_ONE.includes(book),
      onPageTwo,
      again: onPageTwo && PAGE_ONE.includes(book),
      skipped: skipped.includes(book),
    };
  });
  const slotRange = (ids: readonly number[]): [number, number] => {
    const slots = ids.map((b) => slotOf(b, k)).filter((s): s is number => s !== null);
    return slots.length ? [Math.min(...slots), Math.max(...slots)] : [0, 0];
  };
  return {
    books,
    pageTwo: page2,
    pageOneSlots: slotRange(PAGE_ONE),
    pageTwoSlots: slotRange(page2),
    repeated: page2.filter((b) => PAGE_ONE.includes(b)),
    skipped,
  };
}

export type PagingVerdict = { text: string; tone: "good" | "warn" | "bad" };

export function pagingVerdict(k: Change, mode: PagingMode): PagingVerdict {
  if (k === 0) return { text: "No change: both pages are right", tone: "good" };
  if (mode === "cursor") return { text: "Cursor: no repeats, no gaps", tone: "good" };
  if (k === -1) return { text: "Offset: book 6 never shown", tone: "bad" };
  if (k === 1) return { text: "Offset: book 7 shown twice", tone: "warn" };
  if (k === 2) return { text: "Offset: books 8 and 7 twice", tone: "warn" };
  return { text: "Offset: all of page 1 again", tone: "warn" };
}

/** Rail position, 0 to 1, of a change; the five snaps are evenly spaced. */
export function changeToFraction(k: Change): number {
  return CHANGES.indexOf(k) / (CHANGES.length - 1);
}

export function changeFromFraction(f: number): Change {
  const clamped = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  return CHANGES[Math.round(clamped * (CHANGES.length - 1))];
}
