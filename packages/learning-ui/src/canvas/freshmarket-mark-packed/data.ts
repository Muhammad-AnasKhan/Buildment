import type { SequenceSpec } from "../renderers/sequence/types";

// Multi-vendor marketplace course, chapter 20.10 "Vendor update status".
// One PATCH request through the API and the database, then the same request
// from a stale tab. Follows the server rules and status codes in that
// chapter. See spec.md.
export const freshmarketMarkPacked: SequenceSpec = {
  kind: "sequence",
  title: "Mark packed, from two tabs",
  purpose:
    "Follow one PATCH request through the API and the database, then see why a stale second tab gets 409 instead of overwriting.",
  summary:
    "The vendor tab sends PATCH. The API checks the store and the move, and updates the order only if it is still pending, then returns 200 with the saved order. A stale second tab sends the same request, nothing matches, and the API answers 409.",
  actors: [
    { name: "Vendor tab", sub: "browser" },
    { name: "Old tab", sub: "same vendor" },
    { name: "API", sub: "server" },
    { name: "Database", sub: "MongoDB" },
  ],
  steps: [
    {
      from: 0,
      to: 2,
      label: "PATCH packed",
      title: "The vendor clicks Mark packed",
      note: "The page disables the button and sends PATCH /api/vendor/orders/:orderId with the vendor's token. The body asks for packed. It does not send a storeId.",
      chips: ["Authorization: Bearer <vendor-token>", '{ "status": "packed" }'],
    },
    {
      from: 2,
      to: 2,
      label: "check store, move",
      title: "The API checks who and what",
      note: "The API finds the vendor's store from the token, never from the request body. Then it checks the move against its table: pending to packed is allowed.",
      chips: ["store from token", "pending to packed: allowed"],
    },
    {
      from: 2,
      to: 3,
      label: "update if pending",
      title: "Update only if still pending",
      note: "The API asks for one update with three conditions: this order id, this store, and status still pending. If any of them does not match, nothing is written.",
      chips: ["_id: orderId", "storeId: from token", 'status: "pending"'],
    },
    {
      from: 3,
      to: 2,
      label: "saved order",
      tone: "good",
      title: "One order matched",
      note: "The order was still pending, so the update matched it and saved packed. The database returns the saved order.",
      chips: ['status: "packed"'],
    },
    {
      from: 2,
      to: 0,
      label: "200 + order",
      tone: "good",
      outcome: "200 OK",
      title: "The page shows the server's answer",
      note: "The page replaces that row with the order from the response, not with a guess. It announces that the order is now packed and the next action becomes Mark dispatched.",
    },
    {
      from: 1,
      to: 2,
      label: "PATCH packed",
      title: "A stale tab sends the same click",
      note: "The old tab loaded the list before the order was packed. It still shows Mark packed, so its request is exactly the same as step 1.",
      chips: ["still shows: pending"],
    },
    {
      from: 2,
      to: 3,
      label: "update if pending",
      title: "The same update matches nothing",
      note: "The API checks the store and the move as before, then sends the same conditional update. The status is packed now, not pending, so no order matches and nothing is written.",
      chips: ["0 orders matched"],
    },
    {
      from: 2,
      to: 1,
      label: "409 Conflict",
      tone: "warn",
      outcome: "409 Conflict",
      title: "The stale tab is told, not obeyed",
      note: "The order exists for this store, but its status changed, so the API answers 409. The tab explains that the order changed and loads the list again. Without the status condition, a tab this stale could even move a dispatched order back to packed.",
    },
  ],
  tryThis: [
    "At step 3, name the three things the update must match before you read the note.",
    "Predict what step 7 sends back before you open it.",
  ],
  limits:
    "This leaves out the 403 for another vendor's order and the 404 for a missing order. It shows the two tabs one after the other; in real life their requests can arrive in either order, and the rule still holds.",
};
