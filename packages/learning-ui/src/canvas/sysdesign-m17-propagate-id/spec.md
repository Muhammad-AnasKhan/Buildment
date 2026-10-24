# Canvas spec: sysdesign-m17-propagate-id

- **Course and chapter:** system-design, 17.2 beat 5 (Pass the id on every call).
- **Renderer:** `scene` (data only).
- **Claim:** A trace only holds together if every hop passes the trace context on. One call without the header starts a second trace and the order is split.
- **Story:** The api starts trace 4bf9 and calls menu with a traceparent header; menu joins trace 4bf9. The api calls payments with no header; payments says "new trace 7c1e". Verdict: "Payments forgot: the trace splits".
- **Numbers:** Course numbers only (shortened ids).
- **Sources:** W3C Trace Context for the traceparent header [S99]; OpenTelemetry span context propagation [S98 and the traces page, source needed].
