# Canvas spec: sysdesign-m18-fail-fast

- **Course and chapter:** system-design, 18.5 beat 3 (Cheap checks first).
- **Renderer:** `scene` (data only).
- **Claim:** Order stages by cost. A failure you can find in a second should never wait behind a failure-free build of five minutes.
- **Story:** You push a bug. The fast-first pipeline is red at 0.2 s. The slow-first pipeline builds for a long time and turns red at 25 s.
- **Numbers:** 0.2 s against 24.6 s (course challenge 17 part 2, cold cache, 2026-10-24).
- **Limits shown under the picture:** Measured in the challenge with the naive Dockerfile: lint 0.2 s in the cheap-first order; 24.6 s in the slow-first order, with the cold image build 12.2 s. Real pipelines have more stages and queue time on shared runners.
- **Sources:** Course challenge 17 part 2 measurement. Principle: Fowler, Continuous Integration (add to dossier).
