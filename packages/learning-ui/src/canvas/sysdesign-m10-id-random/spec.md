# Canvas spec: sysdesign-m10-id-random

- **Course and chapter:** system-design, 10.7 beat 2 ("Random IDs need no talking, and have no order").
- **Renderer:** `scene` (data only).
- **Claim:** Random UUIDs (version 4) need no coordination, but they carry no time order, so inserts scatter across a sorted index.
- **Story:** Three servers make IDs 9f3c71e0, 02ab9e44 and e71d40b8, which land at 62%, 1% and 90% of the index. Verdict: "No talking needed, but no order".
- **Numbers:** 122 random bits in UUIDv4 and 48 time bits in UUIDv7 [S66]. The IDs are invented.
- **Sources:** S66 (RFC 9562).
