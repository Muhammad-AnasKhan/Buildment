# Canvas spec: sysdesign-m22-prefs-filter

- **Course and chapter:** system-design, 22.5 beat 2 ("Check what she chose").
- **Renderer:** `scene` (data only).
- **Claim:** The notification service decides channels from the person's saved choices, not from the event. The event says what happened; the preferences say how to tell this person.
- **Story:** Sami writes while Layla's phone is off. The chat service tells the notifier. The notifier reads Layla's preferences, gets "push only", skips email and SMS, and asks the push service to send one alert. Verdict: "Only the channels she chose".
- **Numbers:** None.
- **Sources:** None needed (course design).
