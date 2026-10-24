# sysdesign-m14-outbox-crash (14.4, "Crash between the two writes")

## What it teaches
Writing to a database and to a broker in two steps can lose the event (save, then publish) or send a ghost event (publish, then save). An outbox row saved in the same transaction never loses it, but the relay can publish it twice.

## Model (`models/outbox-crash.ts`)
Count the events that reach the broker for one order, and whether the order exists.

| Approach | No crash | Crash between the two steps | Crash after publishing, before marking sent |
|---|---|---|---|
| Save, then publish | 1 event, order saved | 0 events, order saved | not applicable |
| Publish, then save | 1 event, order saved | 1 event, no order (ghost) | not applicable |
| Outbox and relay | 1 event, order saved | 1 event, order saved (after the next relay run) | 2 events, order saved |

For the outbox, "between the two steps" means after the commit and before the relay runs.

## Inputs
Two radio rows inside the picture: approach (Save first, Publish first, Outbox) and crash (No crash, In between, After publish). "After publish" is faded and out of the tab order for the two approaches without a relay, with a hint line. Default: Save first, In between. Switching to an approach without a relay while "After publish" is picked falls back to "In between".

## What moves
Lanes for App, Database, (Relay), Broker. The steps play one after another as arrows and pills (CSS fade-in with staggered delays; remounted on every pick to replay; the final state shows if animation is off). A red crash mark replaces the steps that never run. Under the lanes: event dots on the broker and badges "order saved / no order" and "N events".

## Verdicts (38 characters or fewer)
No crash "One event, one order"; save first "Order saved, event lost"; publish first "Event for an order that is not there"; outbox between "Event sent later: nothing lost"; outbox after publish "Sent twice: the consumer must cope".

## Accessibility
Chips are radios in radiogroups; the verdict and the badges are live regions; the SVG description restates the result. Reduced motion removes the fade-in and shows the full run.

## Primitive choice
The spec suggested `lane-sequence.tsx`. Its lane headers are 112-unit cards (four do not fit 420 units) and it cannot stagger single steps, so the sequence is drawn in the canvas with the house kit and the new `radio-chip-row.tsx`.

## Source
S79. Challenge 13 part 1 is the measured cousin.
