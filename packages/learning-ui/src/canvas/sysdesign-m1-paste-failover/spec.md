# Canvas spec: sysdesign-m1-paste-failover

- **Course and chapter:** system-design, 1.4 beat 7 ("Failure: what breaks, what users see").
- **Renderer:** `scene` (data only).
- **Claim:** The failure step asks, part by part, "what if this dies?" Two stateless app servers behind a load balancer survive one crash, because health checks move traffic to the other.
- **Story:** A request is served by App 1. App 1 crashes (red ring). The load balancer's health check finds it ("App 1 is down"). The next request goes to App 2 and the browser gets the paste. Verdict: "One app down, users still served".
- **Numbers:** none in the picture.
- **Sources:** health checks and failing open, AWS Builders' Library "Implementing health checks" [S19]; Elastic Load Balancing [S15]; PostgreSQL asynchronous standby replicas [S38] (cited in the chapter's fold for the database plan).
