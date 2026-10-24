# Canvas spec: sysdesign-m6-graphql-one-trip

- **Course and chapter:** system-design, 6.2 beat 2 ("GraphQL: one query, exactly these fields").
- **Renderer:** `scene` (data only).
- **Claim:** GraphQL moves the dependent steps of a screen inside the data centre, so a far-away phone pays one round trip.
- **Story:** The phone sends one query; the GraphQL server asks Books (which names seller 7), then Sellers and Reviews at once; it replies with just the fields asked for. Verdict: "One round trip from the phone".
- **Numbers:** 160 ms for the long trip and about 0.25 ms per trip inside the region [S3]; "about 1 ms here" rounds the inside work up.
- **Predict before it (in the chapter):** how long the phone waits with one query.
- **Sources:** [S3] napkin-math. GraphQL's query model is a source-needed note in the chapter. Kitabi is a course example.
