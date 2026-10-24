# Canvas spec: sysdesign-m27-long-tail

- **Course and chapter:** system-design, 27.4 beat 6 ("A rarely watched video pays the full trip").
- **Renderer:** `scene` (data only).
- **Claim:** A video nobody has watched recently is not in the edge cache, so each piece costs a trip to far storage, and start-up is slower.
- **Story:** Omar in Singapore asks for piece 1 of an old lesson. The edge misses, asks storage in EU West, storage reads for about 80 ms, and the piece comes back. The edge shows "+240 ms" (160 ms round trip plus 80 ms read). Verdict: "Long tail pays the full trip".
- **Numbers:** EU West to Singapore round trip about 160 ms; blob GET of 128 KiB about 80 ms (napkin-math, 2026-03-09, "2 to 3 times off" caveat). 160 + 80 = 240 ms.
- **Sources:** S3 (napkin-math). Chapter 27.4 GoDeeper adds that three serial misses at start-up add about 720 ms.
