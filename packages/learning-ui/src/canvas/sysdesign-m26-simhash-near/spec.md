# Canvas spec: sysdesign-m26-simhash-near

- **Course and chapter:** system-design, 26.4 beat 5 (Almost the same page).
- **Renderer:** `scene` (data only). Export: `sysdesignM26SimhashNear`.
- **Claim:** A near copy has a fingerprint a few bits away (10 of 64 in the run), an unrelated page about half the bits away (32 of 64).
- **Story:** Page B is page A with a new date and an ad: 10 of 64 bits differ. Page C is a different article: 32 of 64 bits differ. Verdict: "Small distance means near copy".
- **Numbers:** 10 and 32 bits are results of the chapter's seeded run (text made of made-up words, 600 words each; the near copy has 10 words changed and 8 added).
- **Sources:** Run in the chapter's fold. Source needed for the published method (Charikar 2002; Manku, Jain and Das Sarma 2007).
