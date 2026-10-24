# Canvas spec: sysdesign-m15-queue-handout

- **Course and chapter:** system-design, 15.3 beat 1 ("A queue hands each job to one worker").
- **Renderer:** `scene` (data only).
- **Claim:** In a queue, a job goes to one worker and is gone once it is acknowledged.
- **Story:** The queue holds a, b, c. It hands a to worker 1 and b to worker 2. Worker 1 acks a and a is deleted. Worker 2 acks b and b is deleted. Worker 1 takes c. Verdict: "One job, one worker, then gone".
- **Numbers:** No numbers.
- **Sources:** S83 and S84 (SQS: a received message is hidden for the visibility timeout and removed when the consumer deletes it).
