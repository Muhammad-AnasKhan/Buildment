import type { CustomCanvasSpec } from "../registry";
import { RecrawlPlayCanvas } from "./RecrawlPlayCanvas";

// 26.3 beat 6: when to visit a page again. Model: models/crawl-recrawl.ts.
export const sysdesignM26RecrawlPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "When to visit a page again",
  purpose: "Pick a kind of page and drag how often DalilBot visits it. Two bars show the share of time the saved copy is fresh and the share of visits that find nothing new, both set by the change rate times the gap.",
  limits:
    "Changes are modelled as random events at an average rate, the usual simple model for web pages, and the strip draws them evenly spaced so the picture does not change between renders. Real pages change in bursts, at certain hours and sometimes in ways a crawler cannot see. The three kinds and their rates (6 times a day, once a week, once in 90 days) are course numbers. A row with more marks than fit is drawn at its densest, and the strip's length changes with the gap so that eight visits and at least two changes show. Visit counts assume 10 million pages all kept at the same gap.",
  component: RecrawlPlayCanvas,
};
