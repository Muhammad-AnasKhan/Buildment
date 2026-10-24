# Canvas spec: sysdesign-m24-offer-one-driver

- **Course and chapter:** system-design, 24.4 beat 1 (One offer at a time).
- **Renderer:** `scene` (data only).
- **Claim:** Offering to one driver at a time avoids two drivers heading to one rider, and a time-out keeps the rider from waiting for ever.
- **Story:** Dispatch offers to driver 1; no answer; the offer ends and goes to driver 2; driver 2 accepts; the rider is told.
- **Numbers:** Offer time-out: 10 s (course choice). If a driver accepts 70% of offers, three offers in a row all fail 2.7% of the time (0.3 x 0.3 x 0.3).
- **Sources:** Arithmetic on course assumptions.
