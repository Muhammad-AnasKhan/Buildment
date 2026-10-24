# Canvas spec: sysdesign-m26-one-page

- **Course and chapter:** system-design, 26.2 beat 2 (One page, start to finish).
- **Renderer:** `scene` (data only). Export: `sysdesignM26OnePage`.
- **Claim:** The crawl loop has a check before the frontier: links already seen stop there, and only new ones go round again.
- **Story:** A URL goes frontier to fetcher to parser. The parser saves the text and sends 3 links to the URL check. Two were seen, so one new URL goes back to the frontier. Verdict: "Seen links stop here; new ones loop".
- **Numbers:** The 3 links and the 2 already seen are an example.
- **Sources:** None needed.
