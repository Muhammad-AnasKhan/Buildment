# Canvas spec: net-m2-cidr-drill

- **Course and chapter:** networking, 2.3 practice. Full spec: `agent-ip/work/networking/canvas-specs/net-m2-addr-modes-and-scenes.md`, section "net-m2-cidr-drill".
- **Renderer:** custom beat canvas, `mode="drill"` with `questions: "cidr"` (view in `CidrDrillView.tsx`, sharing `ProgressDots` and `AnswerCard` with `DrillView.tsx`). Model: `models/net-address.ts` (`generateCidrDrill`, `checkCidrAnswer`, `explainCidrQuestion`).
- **Claim:** I can give the size and mask of any `/n` by hand.
- **Questions (five per set):** three "how many addresses are in this /n block" and two "which mask goes with this /n", in a seeded order, each on a different prefix from /9 to /30. Three options; the wrong two are the prefixes one step either side.
- **Seed:** the set number; **New set** moves to the next number. The same set always gives the same five questions.
- **Feedback:** "32 - 20 = 12 host bits, so 4,096" or "20 ones, 12 zeros: 255.255.240.0". End of set: "4 of 5 by hand".
- **Limits (in the fold):** practice only, not saved or graded.
