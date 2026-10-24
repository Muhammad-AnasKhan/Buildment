# Canvas spec: sysdesign-m26-one-queue-hammer

- **Course and chapter:** system-design, 26.3 beat 1 (One shared queue hammers one site).
- **Renderer:** `scene` (data only). Export: `sysdesignM26OneQueueHammer`.
- **Claim:** Order of arrival says nothing about which host the next URL belongs to, so a plain queue can send many fetchers to one host at once.
- **Story:** The queue holds three shop.example URLs in a row. Three fetchers take them and send three requests at the same moment. The site slows down. Verdict: "Hammered site starts to fail".
- **Numbers:** None.
- **Sources:** None needed.
