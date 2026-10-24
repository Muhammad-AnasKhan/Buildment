# Canvas spec: sysdesign-m17-metric-scrape

- **Course and chapter:** system-design, 17.2 beat 3 (A metric is a number over time).
- **Renderer:** `scene` (data only), with a time strip.
- **Claim:** A metric is a small number saved on a schedule. It shows how much and how often, cheaply, but it cannot say which request was slow.
- **Story:** The metrics store pulls the api's request counter three times, at 15, 30 and 45 seconds: 1,200, 1,500, 1,830. Three points sit on the strip. Verdict: "A number per pull; no request named".
- **Numbers:** Course numbers only (15 s pull, the three counts).
- **Sources:** none needed for the idea. The text format of the real counter is covered in the challenge chapter (Prometheus exposition format, source needed there).
