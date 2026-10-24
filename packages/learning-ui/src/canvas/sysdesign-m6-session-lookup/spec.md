# Canvas spec: sysdesign-m6-session-lookup

- **Course and chapter:** system-design, 6.7 beat 2 ("Sessions: the server looks you up").
- **Renderer:** `scene` (data only).
- **Claim:** With sessions, every request costs a lookup in a shared store, and in return a session can be ended instantly.
- **Story:** The seller's request carries sid=a91; the API looks it up (seller 7) and serves it; support deletes a91; the next request's lookup finds nothing and gets 401. Verdict: "Session deleted: refused at once".
- **Numbers:** a key-value lookup within a region is about 500 microseconds [S3], stated in the limits text.
- **Sources:** [S3] napkin-math. Kitabi and seller 7 are a course example.
