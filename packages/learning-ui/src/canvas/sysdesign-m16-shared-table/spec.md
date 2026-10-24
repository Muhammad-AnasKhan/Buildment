# Canvas spec: sysdesign-m16-shared-table

- **Course and chapter:** system-design, 16.3 beat 2 (One owner for the data).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** Two services that share a table are not independent: a change by the owner breaks the reader, and nothing in the code says so.
- **Story:** Reports reads the orders table and its numbers are fine. The Orders team renames total to amount in its own service and database. Reports asks for total again and gets an error.
- **Numbers:** No numbers: the point is the hidden contract.
- **Sources:** Database per service is a source-needed note in chapter 16.3. The story is a course example.
