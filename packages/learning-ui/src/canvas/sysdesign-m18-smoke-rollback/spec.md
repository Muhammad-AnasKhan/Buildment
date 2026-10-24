# Canvas spec: sysdesign-m18-smoke-rollback

- **Course and chapter:** system-design, 18.5 beat 5 (A smoke test can undo a release).
- **Renderer:** `scene` (data only).
- **Claim:** Make the pipeline check the new version before real users get it, and undo the release when the check fails.
- **Story:** The pipeline deploys one v2 pod. Its smoke test gets a 500. The pipeline removes v2. The old v1 keeps serving.
- **Numbers:** None.
- **Limits shown under the picture:** A smoke test only asks whether the new version starts and answers the main requests. It does not prove the release is good. Slower problems show up only under real traffic, which canaries and metrics cover (chapter 18.6).
- **Sources:** None needed.
