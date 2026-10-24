# Canvas spec: sysdesign-m17-log-lines

- **Course and chapter:** system-design, 17.2 beat 2 (One id joins the lines).
- **Renderer:** `scene` (data only).
- **Claim:** A log line says what happened in one place. A shared request id is what lets you find the matching lines on every server.
- **Story:** The api, menu and payments services each write a log line for order r-4471 and send it to log search. Search then holds three lines with one id. Verdict: "One id joins lines from 3 servers".
- **Numbers:** Course numbers only. The id r-4471 is made up.
- **Sources:** none needed for the idea; the SRE book chapter on monitoring covers logs as white-box monitoring [S97].
