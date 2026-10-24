import type { CustomCanvasSpec } from "../registry";
import { DesignLoopCanvas } from "./DesignLoopCanvas";

export const sysdesignM1DesignLoop: CustomCanvasSpec = {
  kind: "custom",
  title: "Step PasteBox through the design loop",
  purpose: "Six step chips move one design along: the scope, the driving number, the blocks, the ID clash, the cache choice and a database failure, each step keeping what the last one added.",
  limits: "PasteBox is fictional and its traffic numbers are assumptions. The picture leaves out the nightly cleanup job, backups and the API. Only App 1 is drawn talking to the cache. The standby takes over at once here; a real failover takes seconds, and because PostgreSQL replication is asynchronous by default it can lose the last moments of writes.",
  component: DesignLoopCanvas,
};
