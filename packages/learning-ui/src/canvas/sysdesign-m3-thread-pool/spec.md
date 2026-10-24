# Canvas spec: sysdesign-m3-thread-pool

- **Course and chapter:** system-design, 3.6 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** In a thread-per-request server, a thread is held for the whole request, including the time it only waits for the database; when all threads wait, new requests queue although the CPU is idle.
- **Story:** Requests 1 to 4 take the four threads, which send their queries and wait ("4 of 4 waiting"). Request 5 arrives: "no free thread", and it waits. Rows come back, one thread frees and replies. Verdict: "4 threads busy doing nothing".
- **Numbers:** Four threads, made up for the picture. A context switch costs about 10 microseconds [S3] (in the chapter's fold, not in the picture).
- **Sources:** [S3] napkin-math (context switch). The thread-per-request model itself has no dossier source yet (`source needed` in chapter 3.6).
