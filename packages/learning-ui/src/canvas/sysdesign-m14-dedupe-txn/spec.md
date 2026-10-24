# Canvas spec: sysdesign-m14-dedupe-txn

- **Course and chapter:** system-design, 14.5 beat 3 (Write the id with the work).
- **Renderer:** `scene` (data only).
- **Claim:** Recording the id and doing the work in one transaction closes the gap in which a crash could leave one without the other.
- **Story:** m-7 arrives. Consumer writes id m-7 and adds 18 in one transaction (balance 18). The copy of m-7 arrives. The id is found and nothing is added.
- **Numbers:** Course numbers: 18, balance 18.
- **Sources:** S79 for the idea that consumers must handle copies; the table design is a course example.
