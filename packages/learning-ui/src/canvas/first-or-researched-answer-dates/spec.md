# Canvas spec: first-or-researched-answer-dates

- **Course and chapter:** build-with-ai (v2), 5.2 "Research before you ask", beat 3.
- **Renderer:** `scene` with a strip (data only).
- **Claim:** An assistant's answer can be older than the rule it describes, because the assistant learned from text that ends at some date. The program's page carries the newer rule.
- **Story:** the strip counts months from January 2025. A tag "text ends (example)" sits at month 8; a tag "2026 rule" sits at month 21 (October 2026); a dashed line "today" sits at month 21.8 (25 October 2026). An "old rule" message goes from the assistant to the page, and the page says "rule changed". Verdict: "The page is newer than the answer".
- **Facts:** Makers publish a knowledge cutoff for each model, and the real cutoff can differ from the published one (B3, B4). Hacktoberfest 2026 stopped counting pull requests (B69). The assistant's date is an invented example.
- **Accessibility:** reduced motion shows the final frame with both tags, the line and the verdict.
