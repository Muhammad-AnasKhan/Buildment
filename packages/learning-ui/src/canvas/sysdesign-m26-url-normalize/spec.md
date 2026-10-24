# Canvas spec: sysdesign-m26-url-normalize

- **Course and chapter:** system-design, 26.4 beat 1 (Three spellings, one page).
- **Renderer:** `scene` (data only). Export: `sysdesignM26UrlNormalize`.
- **Claim:** Normalising URLs before the seen check stops one page from being fetched under many addresses.
- **Story:** A page has three links to the same article: SHOP.example/a, shop.example/a#top and shop.example/a?sid=9. The normaliser turns all three into shop.example/a, and the seen set holds one entry. Verdict: "Three spellings, one page".
- **Numbers:** None.
- **Sources:** None needed. Rules are course choices; chapter 26.4 fold runs the code.
