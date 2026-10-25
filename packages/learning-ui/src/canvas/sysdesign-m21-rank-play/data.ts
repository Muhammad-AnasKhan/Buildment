import type { CustomCanvasSpec } from "../registry";
import { RankPlayCanvas } from "./RankPlayCanvas";

// 21.4 beat 2: drag the half-life and watch five posts change places.
// Model: models/rank-score.ts.
export const sysdesignM21RankPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag how much age counts",
  purpose: "Drag the half-life of a ranking score from 1 hour to 48 hours and watch five posts slide into new places, with the three factors of the tapped post written as a formula above.",
  limits:
    "The five posts, their likes and their closeness to the reader are made up, and the score is a teaching formula: closeness times (1 plus the natural log of 1 plus the likes) times 0.5 to the power of age over half-life. Real rankers use models trained on what readers did, with many more signals, and the course makes no claim about any company's ranker. The picture leaves out the type of post, rules such as no more than two posts in a row from one author, and the cost of scoring.",
  component: RankPlayCanvas,
};
