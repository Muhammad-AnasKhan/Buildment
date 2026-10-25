# Canvas spec: sysdesign-m22-presence-beat

- **Course and chapter:** system-design, 22.4 beat 6 ("Online is a key that expires").
- **Renderer:** `scene` (data only).
- **Claim:** Presence needs no "I am leaving" message. The app sends a heartbeat on a timer and each heartbeat renews a short-lived key. A crash, a lift or a dead battery all look the same: the heartbeats stop and the key expires.
- **Story:** Sami's app pings the presence store twice. Each ping sets the key to live for 60 seconds. Then the phone loses signal and nothing renews the key. After 60 seconds of silence the key expires. Layla asks and gets "offline". Verdict: "60 s of silence means offline".
- **Numbers:** Course numbers: heartbeat every 30 s, key time limit 60 s (two missed beats).
- **Sources:** The lease-with-heartbeat pattern of chapter 12.9. etcd leases expire by TTL [S54]; failure detection by missed heartbeats is the idea behind SWIM and phi accrual [S72, S73].
