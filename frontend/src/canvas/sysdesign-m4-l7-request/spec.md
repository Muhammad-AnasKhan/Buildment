# Canvas spec: sysdesign-m4-l7-request

- **Course and chapter:** system-design, 4.4 beat 2 ("L7 picks for every request").
- **Renderer:** `scene` (data only).
- **Claim:** An L7 balancer chooses per request and can route by what is in the request, such as its path.
- **Story:** The phone sends GET /notes; the balancer sends it to App 1. The second GET /notes goes to App 2. POST /upload matches the upload rule and goes to Uploads. Verdict: "L7: every request is a new choice".
- **Numbers:** None.
- **Sources:** ALB evaluates listener rules per request and routes with round robin by default [S15]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
