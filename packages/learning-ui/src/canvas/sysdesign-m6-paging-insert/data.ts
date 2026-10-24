import type { CustomCanvasSpec } from "../registry";
import { PagingInsertCanvas } from "./PagingInsertCanvas";

// 6.3 beat 4: books 9 down to 1, newest first, 3 per page. Page 1 is taken,
// the list changes (a book deleted, or 1 to 3 books added at the top), then
// page 2 is taken by offset or by cursor. Model: models/paging-insert.ts.
export const sysdesignM6PagingInsert: CustomCanvasSpec = {
  kind: "custom",
  title: "Add new books while you page",
  purpose: "Drag how many new books arrive between page 1 and page 2, then switch between offset and cursor to see repeats and gaps.",
  limits: "Pages of 3 are illustrative. A book whose sort key changes can still appear twice with a cursor, because it really moved.",
  component: PagingInsertCanvas,
};
