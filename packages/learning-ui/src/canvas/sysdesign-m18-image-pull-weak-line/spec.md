# Canvas spec: sysdesign-m18-image-pull-weak-line

- **Course and chapter:** system-design, 18.3 beat 4 (Small images pull fast).
- **Renderer:** `scene` (data only).
- **Claim:** Image size is download time, and on a weak line it decides how long a deploy or a new server takes to start.
- **Story:** The registry sends two images at once. The full image's wait ring runs for 13.7 minutes, the alpine image's for 2.1 minutes. Both are shown at a faster speed.
- **Numbers:** 409.9 MB x 8 = 3,279 Mbit; at 4 Mbit/s that is 820 s, 13.7 min. 62.5 MB x 8 = 500 Mbit; at 4 Mbit/s that is 125 s, 2.1 min. The ratio is 6.6.
- **Limits shown under the picture:** Packed download sizes from the Docker Hub API on 2026-10-24: node:24 409.9 MB, node:24-alpine 62.5 MB (amd64). The 4 Mbit/s line is a made-up example, and Docker only pulls layers you do not have yet.
- **Sources:** Docker Hub API tag sizes, measured 2026-10-24 (node:24-alpine 62.5 MB is also in the dossier, S119).
