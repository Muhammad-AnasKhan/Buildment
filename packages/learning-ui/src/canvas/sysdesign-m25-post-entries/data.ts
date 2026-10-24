import type { CustomCanvasSpec } from "../registry";
import { PostEntriesCanvas } from "./PostEntriesCanvas";

// 25.3 beat 3: tap entries of a sale and a refund in and out. Model: models/ledger-entries.ts.
export const sysdesignM25PostEntries: CustomCanvasSpec = {
  kind: "custom",
  title: "Post a sale, then break the books",
  purpose: "A ticket sale of 100 is three entries: debit the provider-clearing account 100, credit the organizer 90 and credit the fee 10. Tap an entry out and the books are off by exactly its amount. A refund adds three reversing entries, so the history keeps six.",
  limits:
    "One sale of 100 with one fee of 10, and no tax, currency or rounding. Account names are Tazkara's own and the sign convention (a balance is debits minus credits) is the course's choice; real charts of accounts differ. The picture checks one transaction at a time; a real ledger also checks the whole book each night and refuses an unbalanced transaction before it stores anything.",
  component: PostEntriesCanvas,
};
