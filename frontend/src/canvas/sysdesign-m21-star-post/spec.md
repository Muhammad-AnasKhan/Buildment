# Canvas spec: sysdesign-m21-star-post

- **Course and chapter:** system-design, 21.3 beat 4 (One star post is 20 million writes).
- **Renderer:** `scene` (data only).
- **Claim:** In push, the cost of a post is its follower count. A single star post can fill the whole fan-out line for minutes and delay everyone else's posts.
- **Story:** Karim posts. The queue fills with 20 million jobs. Dina posts a minute later and her post waits. Verdict: "One star post blocks everyone's posts".
- **Numbers:** 20,000,000 writes / 150,000 per second = 133 seconds (67 seconds at the 300,000 maximum).
- **Sources:** Arithmetic on course assumptions. Karim and the 20 million are made up.
