# Canvas spec: sysdesign-m6-gateway-route

- **Course and chapter:** system-design, 6.6 beat 2 ("One door in front of many services").
- **Renderer:** `scene` (data only).
- **Claim:** A gateway runs the shared checks once and routes each request to the right service by its path.
- **Story:** GET /books/42 passes "token OK" and "limit OK" and goes to Books, which replies through the gateway; POST /payments passes the same checks and goes to Payments. Verdict: "Check once at the door, then route".
- **Numbers:** the proxy hop of about 50 microseconds [S3] is in the limits text, not drawn.
- **Sources:** [S3] napkin-math proxy hop; [S30] Amazon API Gateway.
