import type { StateMachineSpec } from "../renderers/state-machine/types";

// Multi-vendor marketplace course, chapter 20.10 "Vendor update status".
// The states, the allowed moves and the status codes follow the tables in
// that chapter. See spec.md.
export const freshmarketOrderStatus: StateMachineSpec = {
  kind: "state-machine",
  title: "FreshMarket order status, one move at a time",
  purpose: "See which status changes the vendor PATCH route allows, and which ones it refuses.",
  summary:
    "An order moves from pending to packed to dispatched, one step at a time. The server refuses a skipped step or a backwards step with 400, and a request from a stale tab with 409.",
  states: [
    { id: "pending", name: "pending", sub: "order placed", col: 0, row: 0 },
    { id: "packed", name: "packed", sub: "vendor packed it", col: 1, row: 0 },
    { id: "dispatched", name: "dispatched", sub: "final state", col: 2, row: 0 },
  ],
  edges: [
    { from: "pending", to: "packed", label: "mark packed" },
    { from: "pending", to: "pending", label: "skip: 400", kind: "rejected" },
    { from: "packed", to: "dispatched", label: "mark dispatched" },
    { from: "packed", to: "packed", label: "stale: 409", kind: "rejected" },
    { from: "dispatched", to: "dispatched", label: "go back: 400", kind: "rejected" },
  ],
  steps: [
    {
      state: "pending",
      edge: 0,
      title: "A new order starts as pending",
      note: "Checkout creates the order with status pending. The vendor's orders page shows one next action for it, Mark packed, which sends a PATCH request asking for packed.",
      chips: ["status: pending", "PATCH /api/vendor/orders/:orderId", '{ "status": "packed" }'],
    },
    {
      state: "pending",
      edge: 1,
      tone: "bad",
      outcome: "400",
      title: "Skipping a step is refused",
      note: "A request asks for dispatched while the order is still pending. The server checks its table of allowed moves: pending can only go to packed. It answers 400 and the order does not change.",
      chips: ["pending to dispatched", "400 Bad Request"],
    },
    {
      state: "packed",
      edge: 2,
      title: "Packed, then dispatched",
      note: "After the vendor packs the order, the only allowed move is to dispatched. The page now shows Mark dispatched instead of Mark packed.",
      chips: ["status: packed", '{ "status": "dispatched" }'],
    },
    {
      state: "packed",
      edge: 3,
      tone: "warn",
      outcome: "409 Conflict",
      title: "A stale tab is refused too",
      note: "A second tab loaded the list while the order was pending, so it still offers Mark packed. The server updates an order only if its status is still the one the tab expected. The order is packed now, so nothing matches and the answer is 409. The tab should load the list again.",
      chips: ["expected: pending", "actual: packed", "409 Conflict"],
    },
    {
      state: "dispatched",
      edge: 4,
      tone: "bad",
      outcome: "400",
      title: "Dispatched is the end",
      note: "Dispatched is a final state. There is no next action, so the page shows no button. A request to move it backwards, for example to packed, is refused with 400 unless your README documents that move.",
      chips: ["dispatched: final", "no next action"],
    },
  ],
  tryThis: [
    "Before step 4, predict the status code a stale second tab gets. Then check.",
    "Count the steps where a request arrives but the order does not change. There are three.",
  ],
  limits:
    "This follows the vendor rules in chapter 20.10 only. It leaves out the 403 for another vendor's order, the 404 for a missing order, and anything the customer does, such as cancelling.",
};
