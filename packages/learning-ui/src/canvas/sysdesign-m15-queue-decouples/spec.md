# Canvas spec: sysdesign-m15-queue-decouples

- **Course and chapter:** system-design, 15.2 beat 1 ("Put a line between the request and the work").
- **Renderer:** `scene` (data only).
- **Claim:** A queue lets the request finish without waiting for slow work.
- **Story:** Layla signs up. The API saves her account and puts a job in the queue. It answers Layla at once. The queue hands the job to a worker, who sends the email in her own time. Verdict: "Done in 40 ms; email sent later".
- **Numbers:** Course numbers: 40 ms to save and reply, 3 s for the worker to send.
- **Sources:** S83 (SQS: producers and consumers are decoupled by the queue). See the chapter fold.
