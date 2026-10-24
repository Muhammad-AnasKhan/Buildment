# Canvas spec: sysdesign-m26-bloom-false-yes

- **Course and chapter:** system-design, 26.4 beat 3 (A false yes skips a new page).
- **Renderer:** `scene` (data only). Export: `sysdesignM26BloomFalseYes`.
- **Claim:** A Bloom filter never says "new" for a URL it saw, but can say "maybe seen" for a new one, which costs one skipped page.
- **Story:** Link 1 is new: the filter says no, so the URL goes to the frontier. Link 2 is also new, but the filter says maybe, so the crawler skips it and the page is lost. Verdict: "A false yes skips a new page".
- **Numbers:** About 1% false positives at 9.6 bits per URL and 7 hash functions (S113; measured 1.01% on 1 million URLs in the chapter's run).
- **Sources:** S113.
