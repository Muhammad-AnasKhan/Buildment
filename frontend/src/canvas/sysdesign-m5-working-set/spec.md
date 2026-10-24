# Canvas spec: sysdesign-m5-working-set

- **Course and chapter:** system-design, 5.4 beat 3 ("Skew makes a small cache work").
- **Renderer:** `scene` (data only).
- **Claim:** The hit rate depends on how reads spread over items, not only on cache size. With even traffic, a cache holding 10% of items catches about 10% of reads. With skewed traffic, the same cache catches most reads.
- **Story:** The even shop asks for item 7,312: miss, "1 in 10 hits", tag at 10%. The skewed shop asks for a top seller: hit, "3 in 4 hit", tag at 76.5%. Verdict: "Same cache: 10% or 76.5% hits".
- **Numbers (computed for this course):** 10,000 products, cache holds the 1,000 most read. Even: 1,000 / 10,000 = 10%. Zipf with exponent s = 1 (item k is read in proportion to 1/k): share of the top k is H(k) / H(N), where H(n) = 1 + 1/2 + ... + 1/n. H(1,000) = 7.485, H(10,000) = 9.788, so 76.5%. The top 100 alone get 53.0%.
- **Predict before it (in the chapter):** what share of reads hit a cache that holds 10% of products, when a few products are very popular.
- **Sources:** the Zipf model is an assumption of this picture. A source that web and shop traffic is Zipf-like is needed (`source needed` in the chapter).
