# Canvas spec: sysdesign-m1-compute-blocks

- **Course and chapter:** system-design, 1.3 beat 3 ("Compute: app servers and workers").
- **Renderer:** `scene` (data only).
- **Claim:** App servers do the short work a user waits for and reply quickly. Slow work is handed to a worker, so the user does not wait for it.
- **Story:** The student uploads a PDF. The app server saves it and replies "saved" at once ("can go on"). At the same time it sends "job: preview" to the worker, whose wait ring counts to 3 s before "preview ready". Verdict: "Fast reply now, slow work later".
- **Numbers:** 3 s for a preview is illustrative.
- **Predict before it (in the chapter):** should the app reply before or after the preview is made.
- **Sources:** none needed for the picture.
