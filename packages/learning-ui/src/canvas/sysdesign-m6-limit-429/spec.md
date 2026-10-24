# Canvas spec: sysdesign-m6-limit-429

- **Course and chapter:** system-design, 6.5 beat 1 ("Too many requests: answer 429").
- **Renderer:** `scene` (data only).
- **Claim:** A rate limiter counts per client and refuses the excess with 429 Too Many Requests and Retry-After, so one heavy client does not take the API from everyone else.
- **Story:** The script sends 12 searches; the API's count for the script reaches 5 of 5; 5 get 200 and 7 get 429 with Retry-After; Huda's search arrives, her own count is 1 of 5, and she gets results. Verdict: "Script told 429; Huda still served".
- **Numbers:** 5 searches a second per client is a made-up Kitabi setting.
- **Sources:** [S33] RFC 6585 (429). Retry-After with 429 is a source-needed note in the chapter.
