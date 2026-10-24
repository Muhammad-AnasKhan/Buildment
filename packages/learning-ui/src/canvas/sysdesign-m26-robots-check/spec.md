# Canvas spec: sysdesign-m26-robots-check

- **Course and chapter:** system-design, 26.3 beat 5 (Ask robots.txt, then obey it).
- **Renderer:** `scene` (data only). Export: `sysdesignM26RobotsCheck`.
- **Claim:** robots.txt is fetched first and cached; a URL the rules block is skipped without any request to that path.
- **Story:** The fetcher asks the website for robots.txt, and the rules cache keeps them for 24 hours. /private/a is blocked, so the fetcher skips it. /shop/b is allowed, so it fetches it. Verdict: "Ask once a day; obey the answer".
- **Numbers:** 24 hours is the longest a crawler should reuse a cached copy, per RFC 9309 (source needed in the dossier).
- **Sources:** RFC 9309 (source needed: not in the dossier).
