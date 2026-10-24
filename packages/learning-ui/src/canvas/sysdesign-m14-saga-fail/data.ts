import type { CustomCanvasSpec } from "../registry";
import { SagaFailCanvas } from "./SagaFailCanvas";

// 14.3 beat "Fail a step and watch the undo". Model: models/saga-fail.ts.
export const sysdesignM14SagaFail: CustomCanvasSpec = {
  kind: "custom",
  title: "Fail a step and watch the undo",
  purpose: "Tap the step of the order saga that fails and watch the undo steps of the finished steps run, newest first. Switch the undo steps off to see the half-done order left behind.",
  limits:
    "One failure at a time, and each undo step is shown working the first time. Real undo steps can fail too, so they are retried until they work, and a step can run twice after a crash, so every step and undo needs an idempotency key. The price (18) and the four steps are course examples. With undo steps off the receipt is still retried, because a retry is not an undo. Other orders are not shown, so you do not see them read the half-done state.",
  component: SagaFailCanvas,
};
