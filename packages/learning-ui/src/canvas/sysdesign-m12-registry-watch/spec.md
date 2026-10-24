# Canvas spec: sysdesign-m12-registry-watch

- **Course and chapter:** system-design, 12.9 beat 3 (A watch tells the client).
- **Renderer:** `scene` (data only).
- **Claim:** A watch lets a client react to changes in the registry without asking again and again.
- **Story:** The client watches /pay. payments-2 registers and the client is told. It crashes, its lease runs out, and the client is told again.
- **Numbers:** Lease 10 s (course number); etcd watch event about 10 ms in a healthy cluster [S54].
- **Sources:** S53, S54.
