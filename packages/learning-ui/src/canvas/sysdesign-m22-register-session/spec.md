# Canvas spec: sysdesign-m22-register-session

- **Course and chapter:** system-design, 22.3 beat 1 ("Every line is written in a registry").
- **Renderer:** `scene` (data only).
- **Claim:** Many gateways each hold some of the phones' lines. Any server that wants to reach a user must be able to ask "which gateway holds this user?", so each gateway records every line it accepts in a shared registry.
- **Story:** Sami's phone opens a line to Gateway 2. The gateway checks the login, writes "Sami is here" in the registry, and then answers "line open". Verdict: "Registry knows where Sami is".
- **Numbers:** Course numbers: 50,000 lines planned per gateway (chapter 22.1).
- **Sources:** None needed (course design). The registry idea is the lease-and-heartbeat pattern of chapter 12.9.
