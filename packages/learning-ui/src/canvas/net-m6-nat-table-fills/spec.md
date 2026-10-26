# Canvas spec: net-m6-nat-table-fills

Course and chapter: networking, 6.2 beat 2. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` home router. Data only.

## Claim

The router's NAT table gets one row for each conversation, not one for each device and not one for each direction. Each row pairs the inside address and port with the outside address and port.

## Touch

**Next** plays the next step; **Start over** empties the table again. The laptop opens a connection (row 1), the phone opens one (row 2), and then the learner first taps how many rows the table will hold after the laptop opens a second connection from another port (three: one for each conversation). The new rows are marked "new" in words.

## Limits

A model view of the table, not a recording: the real table (`conntrack -L`, next canvases) has more fields and a timer for each row. Rows are never removed here; timers come in 6.5. Each conversation uses a different source port, so every port is kept; the clash comes in a later canvas. Made-up devices and addresses; `203.0.113.1` comes from a documentation range.
