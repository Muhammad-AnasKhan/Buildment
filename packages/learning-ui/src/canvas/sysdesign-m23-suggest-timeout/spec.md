# Canvas spec: sysdesign-m23-suggest-timeout

- **Course and chapter:** system-design, 23.3 beat 6 ("A slow suggestion is dropped").
- **Renderer:** `scene` (data only).
- **Claim:** Suggestions are a convenience, so a slow suggest service must not slow typing or search. The phone gives up after the budget and the search box keeps working.
- **Story:** The phone sends "sho"; Suggest does not answer. The wait ring counts to 100 ms. The phone shows no ideas. The shopper searches "shoes" and results arrive. Verdict: "No ideas, but search still works".
- **Numbers:** 100 ms is the course budget for a suggestion.
- **Sources:** Course design. Timeouts and load shedding: S89 and S91 (chapter 16).
