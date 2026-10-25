# Canvas spec: sysdesign-m17-sli-ratio

- **Course and chapter:** system-design, 17.3 beat 3 (Good over valid).
- **Renderer:** `scene` (data only).
- **Claim:** An availability SLI is the number of good requests divided by the number of valid requests. A server error is bad. A client mistake (404) is not valid and is left out.
- **Story:** Four requests: two orders succeed (good 1 of 1, 2 of 2), a 503 fails (good 2 of 3), a 404 is not counted. Verdict: "SLI = good / valid = 2 of 3".
- **Numbers:** Course numbers only.
- **Sources:** SLI as "a carefully defined quantitative measure" [S95]. The choice to leave out 4xx is this course's definition, stated in 17.3 and implemented in 17.7.
