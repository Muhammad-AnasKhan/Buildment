# Canvas spec: sysdesign-m25-reversal

- **Course and chapter:** system-design, 25.3 beat 4 ("A refund adds lines, never edits").
- **Renderer:** `scene` (data only).
- **Claim:** In an append-only ledger a refund is a new transaction that swaps every debit and credit of the sale. The sale stays; the balances return to zero; an auditor sees both.
- **Story:** The refund job adds 3 new lines. The ledger grows from 3 to 6 entries. The auditor asks for history and sees the sale and the refund. Verdict: "Undo by adding, never by editing".
- **Numbers:** 3 entries become 6. Sale of 100 split 90 and 10 (course example).
- **Sources:** Course story. Accounting practice of reversing entries (source needed, see the chapter).
