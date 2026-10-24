# Canvas spec: sysdesign-m22-offline-sync

- **Course and chapter:** system-design, 22.4 beat 5 ("Catch up by number").
- **Renderer:** `scene` (data only).
- **Claim:** Offline delivery needs no special queue per phone. The messages are already saved with numbers. A returning phone sends the last number it holds and the service sends everything after it. The push alert only wakes the phone; it is not the delivery.
- **Story:** While Sami's phone is off, messages 4, 5 and 6 are saved and the push service is told. The phone comes back on, receives the alert, opens a line and says "I have up to 3". The chat service sends 4, 5, 6. The phone confirms "got up to 6". Verdict: "Catch up from the last number held".
- **Numbers:** Course numbers: messages 4 to 6, last held 3.
- **Sources:** None needed (course design). The "ask after the last id" idea is the same as in chapter 3.5 and the position token of chapter 8.4.
