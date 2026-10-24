# Canvas spec: sysdesign-m21-push-post

- **Course and chapter:** system-design, 21.3 beat 1 (Push: copy the post into every timeline).
- **Renderer:** `scene` (data only).
- **Claim:** Fan-out on write does the work when a post is published: one timeline write per follower. Reads become one lookup.
- **Story:** Dina's post reaches the worker. The worker writes its id into Omar's, Lina's and Sami's timelines, one after another. Verdict: "Push: one write per follower".
- **Numbers:** Everyday account in chapter 21.3: 100 followers, so 100 timeline writes per post.
- **Sources:** A course story; the trade-off is standard. No company design is claimed (the 2012 Twitter timelines talk is listed as S103 in the dossier but its fan-out detail was not verified).
