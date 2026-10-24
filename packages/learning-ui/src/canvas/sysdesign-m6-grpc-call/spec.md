# Canvas spec: sysdesign-m6-grpc-call

- **Course and chapter:** system-design, 6.2 beat 3 ("gRPC: typed calls between services").
- **Renderer:** `scene` (data only).
- **Claim:** gRPC suits calls between your own services: both sides are generated from one contract, and many calls share one HTTP/2 connection.
- **Story:** Orders and Payments both say "code from proto"; Orders sends three Charge calls in quick succession on one connection; Payments checks "types match" and sends three replies. Verdict: "Small typed calls on one connection".
- **Numbers:** none; three calls stand for many.
- **Sources:** [S12] RFC 9114 section 1 (HTTP/2 multiplexes streams on one TCP connection). gRPC and Protocol Buffers details are a source-needed note in the chapter.
