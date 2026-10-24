# Canvas spec: sysdesign-m18-build-once

- **Course and chapter:** system-design, 18.5 beat 4 (Build once, promote the same image).
- **Renderer:** `scene` (data only).
- **Claim:** Build one artifact per commit and promote it. Do not rebuild for each environment.
- **Story:** CI pushes image ab12cd. Staging pulls it and the tests run against ab12cd. Production pulls the same ab12cd.
- **Numbers:** None.
- **Limits shown under the picture:** The fingerprint (ab12cd here) stands for the image digest. Settings that differ between environments, such as a database address, come in from outside the image. If each environment rebuilt from source, each could contain different bytes.
- **Sources:** Principle from Humble and Farley, Continuous Delivery (add to dossier).
