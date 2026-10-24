# Canvas spec: sysdesign-m6-timeout-unknown

- **Course and chapter:** system-design, 6.4 beat 1 ("A timeout hides what happened").
- **Renderer:** `scene` (data only).
- **Claim:** After a timeout the client cannot tell whether the request was lost, failed, or succeeded with a late reply.
- **Story:** Huda's Pay reaches the API and the provider; the provider charges $18; its reply is slow; the phone's wait ends with "no answer" and the phone asks "charged or not?"; the late reply reaches the API ("reply too late"). Verdict: "Timeout: the app cannot tell".
- **Numbers:** the 10-second timeout is a made-up course number.
- **Sources:** [S89] Brooker, Timeouts, retries and backoff with jitter.
