# Canvas spec: sysdesign-m1-front-door

- **Course and chapter:** system-design, 1.3 beat 2 ("The front door: gateway and load balancer").
- **Renderer:** `scene` (data only).
- **Claim:** The front door has two jobs. A gateway decides whether a request may enter (who is calling, how often). A load balancer decides which server handles it.
- **Story:** The phone's GET /notes passes the gateway ("key OK") and the load balancer sends it to App 1. The next request goes to App 2. A script sending hundreds of requests a second hits the gateway's limit and gets 429. Verdict: "Front door: check, limit, spread".
- **Numbers:** the script's rate is illustrative. 429 is the status code for Too Many Requests.
- **Sources:** 429, RFC 6585 [S33]; API Gateway token bucket throttling and 429 [S30]; ALB round robin per request and NLB flow hash per connection [S15]; load balancing algorithms in Envoy [S16].
