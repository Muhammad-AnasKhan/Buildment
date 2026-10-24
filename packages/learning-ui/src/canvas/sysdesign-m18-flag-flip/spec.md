# Canvas spec: sysdesign-m18-flag-flip

- **Course and chapter:** system-design, 18.6 beat 5 (Feature flags: release is not deploy).
- **Renderer:** `scene` (data only).
- **Claim:** A flag separates deploying code from releasing a feature, so the rollback is a config change, not a new deploy.
- **Story:** You set the flag to 5%. Five percent of users hit the bug. You set the flag to off. The app stops showing the feature at once.
- **Numbers:** None.
- **Limits shown under the picture:** Flags live in config the app reads. Old flags left in the code become clutter and risk, so remove them after the launch. A flag only helps if the code path behind it is safe to switch at any time.
- **Sources:** Fowler, Feature Toggles (aka Feature Flags), martinfowler.com [verified 2026-10-24, add to dossier].
