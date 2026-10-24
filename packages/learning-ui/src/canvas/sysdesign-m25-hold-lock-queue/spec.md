# Canvas spec: sysdesign-m25-hold-lock-queue

- **Course and chapter:** system-design, 25.2 beat 4 ("A lock keeps the seat safe, and the line grows").
- **Renderer:** `scene` (data only).
- **Claim:** A pessimistic lock (chapter 7.5) never oversells, but every other buyer waits for as long as the lock is held. If a card check runs inside the lock, one hot seat serves one buyer per 200 ms.
- **Story:** Dina locks seat 7 and checks her card. Omar asks for the lock and waits 200 ms. Dina commits. Omar is told "sold out". Verdict: "Safe, but every buyer waits in line".
- **Numbers:** 200 ms of card check inside the lock, which would limit one seat to 1 / 0.2 = 5 lock holders a second. Course number.
- **Sources:** Chapter 7.5 for row locks and hold time. The 200 ms is a course number.
