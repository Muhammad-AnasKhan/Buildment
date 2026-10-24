# Canvas spec: sysdesign-m27-popular-edge

- **Course and chapter:** system-design, 27.4 beat 4 ("A popular video costs one trip to storage").
- **Renderer:** `scene` (data only).
- **Claim:** For a popular piece, only the first viewer in a region causes a read from storage; every later viewer is served from the edge copy.
- **Story:** Viewer A asks the empty edge for piece 1 (miss). The edge fetches it from storage, keeps a copy and sends it on. Viewer B asks later and gets a hit. Storage shows "read once". Verdict: "One trip to storage, many views".
- **Numbers:** none.
- **Sources:** Chapter 5.7 (CDN and edge); cache-aside in chapter 20.4; `Cache-Control` RFC 9111 [S22].
