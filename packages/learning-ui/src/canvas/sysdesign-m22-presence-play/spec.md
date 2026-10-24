# Canvas spec: sysdesign-m22-presence-play

- **Course and chapter:** system-design, module 22, chapter 22.4 beat 7, "Drag the ping gap, watch the cost".
- **Renderer:** custom beat canvas on `BeatFrame`. Pure model in `models/dardasha-presence.ts`; the gap rail uses `primitives/snap-stops-rail.tsx` and the toggle `primitives/beat-choice.tsx`.
- **Claim:** Presence is a heartbeat from every connected phone, so its cost is connected phones divided by the gap, not the message rate. A shorter gap finds offline phones faster and costs more; ending the ping at the gateway moves the cost off the presence store.

## Model (3,000,000 connected phones; 13,889 messages a second at peak)

| Quantity | Formula |
|---|---|
| Pings a second | 3,000,000 / gap |
| Times the message rate | pings a second / 13,889 |
| Shown offline after | 2 x gap seconds |
| Store writes, store mode | pings a second |
| Store writes, gateway mode | 3,125 status changes (plus 60 gateway leases renewed every 5 seconds, 12 writes a second, which the picture leaves out and writes as "~3,125 /s") |

| Gap (s) | Pings /s | Times the message rate | Offline after | Store writes /s (gateway mode) |
|---|---|---|---|---|
| 5 | 600,000 | 43.2 | 10 s | about 3,125 |
| 15 | 200,000 | 14.4 | 30 s | about 3,125 |
| 30 | 100,000 | 7.2 | 60 s | about 3,125 |
| 60 | 50,000 | 3.6 | 120 s | about 3,125 |
| 120 | 25,000 | 1.8 | 240 s | about 3,125 |

## Inputs

Gap between pings: 5, 15, 30, 60, 120 seconds on a snap rail inside the picture (default 30). One toggle outside the picture: "A ping ends at" the store or the gateway (default the store).

## Picture

Phones on the left, the gateways and the presence store on the right. Ping dots flow from the phones to the gateways at a rate that follows the pings a second; in store mode they flow on to the store at the same rate, in gateway mode only a thin stream (the status changes) reaches it. A card says how long until a friend who left shows offline. Two bars on one scale: pings a second and messages a second.

## Verdicts (the first rule that holds)

- `Pings are {n}x the message rate` (store mode and n 3 or more; bad)
- `Cheap, but a dot 4 minutes late` (gateway mode and gap 120; warn)
- `Cheap: store sees only changes` (gateway mode; good)
- `Pings below 2x the message rate` (store mode and n under 3; warn)

## Accessibility

The rail and the toggle carry text such as "ping every 30 seconds, 100,000 pings a second, 7.2 times the message rate, offline shown after 60 seconds, each ping is written to the store, store writes 100,000 a second".

## Reduced motion

The pings do not flow; the bars and the verdict show the final values.

## Sources

Arithmetic on course numbers. The 3,125 changes a second is 15 million devices x 6 x 3 / 86,400 (course assumptions).
