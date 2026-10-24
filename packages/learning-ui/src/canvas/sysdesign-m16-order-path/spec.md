# Canvas spec: sysdesign-m16-order-path

- **Course and chapter:** system-design, 16.3 beat 3, "Wait for the answer, or send a message". Playable; new slug.
- **Renderer:** custom beat canvas on `BeatFrame`: Checkout, three call cards (tap to switch Wait and Message), three service cards (tap to fail or revive), a queue pill for each message, two number cards, `VerdictBanner`. One control outside the picture: Reset.
- **Claim:** Waiting for the answer gives certainty but ties your time and availability to the other service. Sending a message frees you from it but you learn the result later. Wait when the customer needs the answer now; send a message when they do not.
- **Input:** calls from Checkout in order: Stock (30 ms), Payments (80 ms), Notifications (40 ms); all Wait at the start. Tap a call card to toggle; tap a service to fail it. 44 px targets.
- **Model** (`model.ts`, `evaluate`): customer wait is the sum of the waited calls; the order fails when a waited service is down (the first in the order Stock, Payments, Notifications is named); a message never delays or fails the order and waits in a queue ("1 waiting") when its service is down. Availability is 0.999 to the power of the number of waits.
- **Numbers to check** (tested): all three waits 150 ms, 99.7% (0.997003); Stock and Payments 110 ms, 99.8% (0.998001); Stock only 30 ms, 99.9%; Payments and Notifications 120 ms, 99.8%.
- **Verdicts:** "Order placed in 150 ms" (good); "Order failed: Notifications is down", "... Payments ...", "... Stock ..." (bad); "Placed in 110 ms; email waits" (good); "Placed; payment unconfirmed" and "Placed; stock may run out" (warn). All 38 characters or fewer.
- **Motion:** a request dot walks the waited lines one after another, and a message dot goes to its queue at the start. A wait after a failed wait does not start.
- **Reduced motion:** no dot; the drawn path (solid line for Wait, dashed for Message, a red cross at a down service) carries the meaning. The queue pill changes without sliding.
- **Accessibility:** each call card is a toggle button, for example "Notifications, waits for the answer, 40 ms"; each service is a toggle button "Stock service: up, press to fail it".
- **Sources:** SQS at-least-once delivery [S83]; outbox [S79]; series availability from chapter 2.6. The call times and the 99.9% are course numbers.
