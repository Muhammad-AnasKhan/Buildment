import type { CustomCanvasSpec } from "../registry";
import { WaitingRoomCanvas } from "./WaitingRoomCanvas";

// 25.2 beat 7: drag the admit rate. Model: models/waiting-room.ts.
export const sysdesignM25WaitingRoom: CustomCanvasSpec = {
  kind: "custom",
  title: "Let fans in at a steady rate",
  purpose: "Drag the admit rate and watch the fans inside, the seat store's load against its plan, and the time to sell out. A good rule keeps about as many fans inside as there are seats.",
  limits:
    "Tazkara is made up and every number is a course assumption: 400,000 fans, 20,000 seats, 2 minutes inside, 4 requests for each admitted fan, a seat store planned for 5,000 requests a second, and half of the admitted fans buying. The picture admits fans at a perfectly steady rate and every fan behaves the same; real fans retry, leave and arrive in bursts. The sale animation is sped up 20 times and shows the first 4 minutes only. The fairness rule (who goes first) is not drawn.",
  component: WaitingRoomCanvas,
};
