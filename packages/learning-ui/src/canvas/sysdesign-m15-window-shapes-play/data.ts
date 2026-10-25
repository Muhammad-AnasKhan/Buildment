import type { CustomCanvasSpec } from "../registry";
import { WindowShapesPlayCanvas } from "./WindowShapesPlayCanvas";

// 15.6 beat 2, "Three ways to cut time into windows". Model: ./model.ts.
export const sysdesignM15WindowShapesPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Three ways to cut time into windows",
  purpose: "Tap a window shape. The same eight events are counted once in a tumbling window, three times in a sliding window, and by activity in a session window.",
  limits:
    "Eight made-up events at fixed seconds, and windows measured in event time. Tumbling windows are 60 s and start at multiples of 60; sliding windows last 60 s and start every 20 s, so each event is in three of them; a session ends after 40 s without an event. A real engine also has to decide when a window is finished (the watermark, the next beat), and a late event can merge two sessions.",
  component: WindowShapesPlayCanvas,
};
