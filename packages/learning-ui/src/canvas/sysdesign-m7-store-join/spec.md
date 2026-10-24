# Canvas spec: sysdesign-m7-store-join

- **Course and chapter:** system-design, 7.2 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** A relational database keeps related facts in linked tables and can combine them in one query, inside one transaction.
- **Story:** The app sends one query. The database reads the tickets, events and venues tables and returns one answer. Verdict: 'One query, one trip, one answer'.
- **Numbers:** Three tables, one query, one answer. No timing numbers.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course example. Relational model and joins: standard SQL; PostgreSQL documentation (queries).
