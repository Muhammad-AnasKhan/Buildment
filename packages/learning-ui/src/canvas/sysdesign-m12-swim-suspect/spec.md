# Canvas spec: sysdesign-m12-swim-suspect

- **Course and chapter:** system-design, 12.8 beat 4 (Suspect first, declare dead later).
- **Renderer:** `scene` (data only).
- **Claim:** A failure detector that suspects first and declares dead only after a delay gives a slow node time to say it is alive.
- **Story:** A suspects B and gossips it. C tells B. B bumps its incarnation number to 2 and gossips alive #2. A and C clear the suspicion.
- **Numbers:** Incarnation numbers 1 and 2.
- **Sources:** S72 (suspicion and incarnation numbers).
