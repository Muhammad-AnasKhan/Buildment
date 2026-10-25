// 25.3 "Post a sale, then break the books". A sale is one transaction of
// three entries; a refund adds three reversing entries. Debits must equal
// credits. Pure functions, no React.

export type Side = "debit" | "credit";
export type Step = "sale" | "refund";

export type Entry = {
  id: string;
  step: Step;
  side: Side;
  account: string;
  amount: number;
};

export const ACCOUNTS = ["provider-clearing", "organizer-payable", "fee-revenue"] as const;

export const ENTRIES: readonly Entry[] = [
  { id: "sale-clearing", step: "sale", side: "debit", account: "provider-clearing", amount: 100 },
  { id: "sale-organizer", step: "sale", side: "credit", account: "organizer-payable", amount: 90 },
  { id: "sale-fee", step: "sale", side: "credit", account: "fee-revenue", amount: 10 },
  { id: "refund-clearing", step: "refund", side: "credit", account: "provider-clearing", amount: 100 },
  { id: "refund-organizer", step: "refund", side: "debit", account: "organizer-payable", amount: 90 },
  { id: "refund-fee", step: "refund", side: "debit", account: "fee-revenue", amount: 10 },
];

export const ALL_IDS: readonly string[] = ENTRIES.map((e) => e.id);

export const sideWord = (side: Side) => (side === "debit" ? "Debit" : "Credit");

/** "Debit provider-clearing 100". */
export const entryText = (e: Entry) => `${sideWord(e.side)} ${e.account} ${e.amount}`;

/** The entries on screen: the sale alone, or the sale and its refund. */
export function shown(step: Step): Entry[] {
  return ENTRIES.filter((e) => step === "refund" || e.step === "sale");
}

export type Books = {
  debits: number;
  credits: number;
  /** debits minus credits; zero when balanced. */
  diff: number;
  count: number;
  balanced: boolean;
  balances: Record<string, number>;
};

/** The books for the shown entries that are included (not tapped out). */
export function books(step: Step, included: ReadonlySet<string>): Books {
  const balances: Record<string, number> = Object.fromEntries(ACCOUNTS.map((a) => [a, 0]));
  let debits = 0;
  let credits = 0;
  let count = 0;
  for (const e of shown(step)) {
    if (!included.has(e.id)) continue;
    count++;
    if (e.side === "debit") {
      debits += e.amount;
      balances[e.account] += e.amount;
    } else {
      credits += e.amount;
      balances[e.account] -= e.amount;
    }
  }
  return { debits, credits, diff: debits - credits, count, balanced: count > 0 && debits === credits, balances };
}

export type BooksVerdict = { text: string; tone: "good" | "bad" | "accent" };

/** At most 38 characters. */
export function booksVerdict(step: Step, b: Books): BooksVerdict {
  if (b.count === 0) return { text: "Nothing posted yet", tone: "accent" };
  if (b.balanced) {
    if (step === "refund" && b.count === 6) return { text: "Refunded: 6 entries, balances 0", tone: "good" };
    return { text: "Balanced: debits equal credits", tone: "good" };
  }
  return { text: `Off by ${Math.abs(b.diff)}: a ${b.diff < 0 ? "debit" : "credit"} is missing`, tone: "bad" };
}

/** An account balance as the pills write it: "provider-clearing 100", "organizer-payable -90". */
export const balanceText = (account: string, balance: number) => `${account} ${balance}`;

export function booksValueText(step: Step, b: Books): string {
  const v = booksVerdict(step, b);
  const accounts = ACCOUNTS.map((a) => balanceText(a, b.balances[a])).join(", ");
  return `${v.text}. Debits ${b.debits}, credits ${b.credits}. ${b.count} ${b.count === 1 ? "entry" : "entries"}. ${accounts}`;
}

/** The largest total the bars can reach in a step, so a bar's height is its total over this. */
export const barScale = (step: Step) => (step === "refund" ? 200 : 100);
