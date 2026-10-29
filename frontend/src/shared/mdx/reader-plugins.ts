// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
/**
 * The remark plugins every chapter reader runs, in order: the web reader
 * (frontend/src/mdx/compile.tsx) and the desktop app's lesson parser. Keeping
 * one list means a new block, such as branded diagrams, reaches every surface
 * at once. remarkDiagram must run before remarkMermaid, which draws whatever
 * Mermaid it did not convert.
 */
import { remarkChecklist } from "./remark-checklist";
import { remarkLearningLog } from "./remark-learning-log";
import { remarkDiagram } from "./remark-diagram";
import { remarkMermaid } from "./remark-mermaid";

export const readerRemarkPlugins = [remarkChecklist, remarkLearningLog, remarkDiagram, remarkMermaid];
