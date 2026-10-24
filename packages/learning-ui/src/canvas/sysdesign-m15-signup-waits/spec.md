# Canvas spec: sysdesign-m15-signup-waits

- **Course and chapter:** system-design, 15.1 beat 1 ("Layla waits for an email").
- **Renderer:** `scene` (data only).
- **Claim:** When the request does the slow work itself, the user waits for all of it.
- **Story:** Layla taps Create account. The API saves the account, calls the email service and waits. The service is slow today. After 3 seconds it answers and the API finally tells Layla she is done. Verdict: "Layla waited 3 s for an email".
- **Numbers:** Course numbers: 40 ms to save, 3 s for the email call.
- **Sources:** None needed (set-the-scene story). Little's law from chapter 2.5 is used in the chapter fold.
