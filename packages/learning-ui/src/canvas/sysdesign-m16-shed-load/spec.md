# Canvas spec: sysdesign-m16-shed-load

- **Course and chapter:** system-design, 16.5 beat 5 (Refuse early, serve well).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** When demand is above capacity, queueing everyone makes every answer late; refusing the excess early keeps the rest fast.
- **Story:** The line grows by 50 a second and passes 100 after 2 seconds, so answers come after the client has given up. The server then sheds: it answers the extra 50 with a quick 503 busy and serves 100 a second on time.
- **Numbers:** Arrivals 150/s, capacity 100/s: the line grows by 50/s, reaching 100 requests (1 s of waiting) after 2 s.
- **Sources:** Load shedding [S91]; Stripe's load shedders [S32]; Little's law from chapter 2.5.
