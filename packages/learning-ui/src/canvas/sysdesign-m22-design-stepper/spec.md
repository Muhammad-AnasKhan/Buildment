# Canvas spec: sysdesign-m22-design-stepper

- **Course and chapter:** system-design, module 22, chapter 22.2 beat 3, "Step through the design at peak".
- **Renderer:** custom beat canvas on `BeatFrame` with the house design stepper picture (`primitives/design-stepper.tsx`, `models/design-stepper.ts`), as in `sysdesign-m20-design-stepper`. Data in `models/dardasha-design.ts`, course numbers in `models/dardasha-numbers.ts`.
- **Claim:** The numbers decide the blocks. One server cannot hold 3 million lines; gateways fix the lines, partitions fix the writes, and the registry and notifier come last. Each block is sized against the number that stresses it.

## Steps

| Step | Adds | Number on the stressed block |
|---|---|---|
| 1 One box | Phones and one server | 3,000,000 lines against a plan of 50,000: 60x its plan (bad) |
| 2 Gateways | 60 gateways, 7 chat servers, the store | Store takes 13,889 writes /s against 2,500: 5.6x its plan (bad) |
| 3 Split store | k partitions by a hash of the conversation id | 13,889 / k each: k = 4 1.4x (bad), k = 6 93% (warn), k = 8 69% (good) |
| 4 Registry | Registry, two nodes | 41,667 + 3,125 = 44,792 /s against 50,000 per node: 90% on one, 45% on each of two |
| 5 Notifier | Push queue and notifier | 10% of 41,667 deliveries: 4,167 jobs /s; the other blocks are unchanged |

## Input

Back and Next under the picture (or tap a step chip). In step 3 only: partition count 4, 6 or 8 (default 8), three chips inside the picture with real buttons laid over them.

## Differences from the first spec

- The registry pill is "45% each" with a separate "2 nodes" chip, because a status pill holds 15 characters at most.
- Phones, Gateways, Chat servers and Store sit in a 3 column layout (the registry above on the right, the queue and notifier below) because four 112 wide cards do not fit one row of a 420 wide picture.

## Accessibility

Step chips are buttons ("Step 3: Split store"); the partition chips are buttons named "Step 3, split the store, 8 partitions, store at 69% of plan"; each card has a text pill with its load; the sentence under the picture is a live region.

## Reduced motion

The requests do not run; the cards show their final pills.

## Sources

Arithmetic on course numbers; the 2,500 write plan follows chapter 20.2.
