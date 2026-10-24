# Canvas spec: sysdesign-m25-missing-webhook

- **Course and chapter:** system-design, 25.4 beat 4 ("The webhook that never comes").
- **Renderer:** `scene` (data only).
- **Claim:** Silence from the provider is not proof of failure. A checker asks the provider for the payment's status after a wait and applies it with the same safe, repeatable posting.
- **Story:** pay_7 is pending, silent for 300 seconds. The checker wakes, asks the provider, learns "captured", and marks pay_7 paid. Verdict: "No webhook? Ask the provider".
- **Numbers:** 300 seconds of silence; a check every 5 minutes (course numbers).
- **Sources:** Course design. Fetching a payment by id is standard in provider APIs (source needed in the chapter).
