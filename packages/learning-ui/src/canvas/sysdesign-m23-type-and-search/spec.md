# Canvas spec: sysdesign-m23-type-and-search

- **Course and chapter:** system-design, 23.1 beat 1 ("Every letter is a request").
- **Renderer:** `scene` (data only).
- **Claim:** A search box that suggests as you type sends one suggestion call per letter, so suggestions are called several times for every search.
- **Story:** The phone sends s, sh, sho, shoe, shoes to Suggest, one after the other. Then one search goes to Search and results come back. Verdict: "5 suggestions for every search".
- **Numbers:** 5 suggestion calls to 1 search is the course assumption used in 23.1.
- **Sources:** Course story, no source needed.
