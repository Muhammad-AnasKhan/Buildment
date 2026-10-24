# Canvas spec: sysdesign-m22-collapse-limit

- **Course and chapter:** system-design, 22.5 beat 6 ("Forty messages become one alert").
- **Renderer:** `scene` (data only).
- **Claim:** A notification system protects the person, not only the provider. It counts events for one person and one chat for a short time and sends one summary alert, which keeps the person inside a per-user limit.
- **Story:** The Family chat sends messages while Sami's phone is off. The notifier counts 3, then 40. It sends one push request, "40 new in Family", and Sami's phone gets one alert. Verdict: "40 messages, one alert".
- **Numbers:** Course numbers: 40 messages in a minute, a limit of 3 alerts a minute per person.
- **Sources:** The per-user limit is a token bucket (chapter 6.5; API Gateway [S30], Stripe [S32]).
