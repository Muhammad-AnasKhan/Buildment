# Canvas spec: sysdesign-m18-canary-compare

- **Course and chapter:** system-design, 18.6 beat 3 (Canary: a few users first).
- **Renderer:** `scene` (data only).
- **Claim:** A canary limits the blast radius: the share of users who can be hurt by a bad release.
- **Story:** Most requests go to stable (0.2% errors). The canary shows 9% errors. The router drops the canary to 0%.
- **Numbers:** Example from the Google SRE workbook: a 20% error rate on a 5% canary shows up as about 1% overall [S110].
- **Limits shown under the picture:** Compare the canary with the stable version at the same time, not with last week. A canary with 5% of traffic needs enough requests to show a real difference; very small errors take longer to see.
- **Sources:** Google SRE Workbook, canarying releases [S110].
