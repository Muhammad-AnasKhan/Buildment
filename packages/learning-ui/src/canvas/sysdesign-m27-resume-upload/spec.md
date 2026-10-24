# Canvas spec: sysdesign-m27-resume-upload

- **Course and chapter:** system-design, 27.3 beat 1 ("A dropped connection resumes, not restarts").
- **Renderer:** `scene` (data only), with a strip of chunk numbers.
- **Claim:** A chunked upload resumes from the first missing chunk, because the server records what it has and the phone asks.
- **Story:** Chunks 1 and 2 are sent and saved (green tags). The phone goes offline before chunk 3 (amber tag). When back, it asks "which chunks?", the server answers "chunks 1, 2", and the phone sends chunk 3. Verdict: "Resume at chunk 3, not chunk 1".
- **Numbers:** 8 MB chunks, 38 chunks for 300 MB (course numbers).
- **Sources:** Idempotent chunk writes are chapter 6.4. S3 multipart and tus are listed as "source needed" in the chapter.
