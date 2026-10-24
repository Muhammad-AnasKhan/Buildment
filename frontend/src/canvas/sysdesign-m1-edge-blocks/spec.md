# Canvas spec: sysdesign-m1-edge-blocks

- **Course and chapter:** system-design, 1.3 beat 1 ("The edge: DNS and the CDN").
- **Renderer:** `scene` (data only).
- **Claim:** Before a request reaches your servers, DNS turns the name into an address, and a CDN can answer for static files from a copy close to the user.
- **Story:** The phone asks DNS "daftar.app?" and gets 203.0.113.7 (a documentation address). It then asks the CDN for logo.png, which answers from its cached copy. Verdict: "Edge: find the app, serve nearby".
- **Numbers:** none in the picture.
- **Sources:** DNS TTL, RFC 1035 [S9]; recursive and iterative resolution, RFC 1034 [S9b]; Cache-Control, RFC 9111 [S22]; CloudFront invalidation [S28]; Route 53 routing policies [S111] (cited in the chapter's folds).
