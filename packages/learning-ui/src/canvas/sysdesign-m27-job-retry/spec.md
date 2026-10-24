# Canvas spec: sysdesign-m27-job-retry

- **Course and chapter:** system-design, 27.3 beat 4 ("A failed job reruns under the same name").
- **Renderer:** `scene` (data only).
- **Claim:** A retried job is safe when its output name comes from the job (video, quality, chunk), not from the worker.
- **Story:** The queue hands "720p chunk 7" to worker A, which crashes. After the timeout the job returns to the queue and goes to worker B. B writes `v81/720p/0007`; storage holds one file. Verdict: "Same name: a retry is safe".
- **Numbers:** none beyond the example key.
- **Sources:** S83 (queues deliver at least once), S84 (visibility timeout), S85 (dead letter queue); chapter 15.5.
