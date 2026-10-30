/**
 * The remark plugins every chapter reader runs, in order: the web reader
 * (frontend/src/mdx/compile.tsx) and the desktop app's lesson parser. Keeping
 * one list means a new block, such as branded diagrams, reaches every surface
 * at once. remarkDiagram must run before remarkMermaid, which draws whatever
 * Mermaid it did not convert.
 */
import { remarkChecklist } from "./remark-checklist.js";
import { remarkLearningLog } from "./remark-learning-log.js";
import { remarkDiagram } from "./remark-diagram.js";
import { remarkMermaid } from "./remark-mermaid.js";

export const readerRemarkPlugins = [remarkChecklist, remarkLearningLog, remarkDiagram, remarkMermaid];
