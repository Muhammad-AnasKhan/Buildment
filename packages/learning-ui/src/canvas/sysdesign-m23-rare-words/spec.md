# Canvas spec: sysdesign-m23-rare-words

- **Course and chapter:** system-design, 23.2 beat 5 ("Rare words count more").
- **Renderer:** `scene` (data only), with a score strip.
- **Claim:** A word that few products contain carries more weight than a word most products contain, so a product with the rare query word ranks first.
- **Story:** Query "red waterproof shoes" over the three products. The ranker sends weights to product 1 (red 0.4, shoe 0.4, total 0.81) and to product 3 (red 0.4, waterproof 1.1, shoe 0.4, total 1.91). Verdict: "Product 3 wins on one rare word".
- **Numbers:** weight = ln(3 / number of products with the word): red ln(3/2) = 0.405, shoe 0.405, waterproof ln(3/1) = 1.099. Totals: 0.811 and 1.910 (computed with the chapter code). The cards show rounded values: 0.4, 1.1, 0.81, 1.91.
- **Sources:** Course arithmetic. The weighting idea is explained in the chapter's fold; a first-party source for TF-IDF or BM25 is flagged as needed there.
