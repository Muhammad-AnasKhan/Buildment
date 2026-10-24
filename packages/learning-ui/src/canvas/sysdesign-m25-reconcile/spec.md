# Canvas spec: sysdesign-m25-reconcile

- **Course and chapter:** system-design, 25.4 beat 5 ("Reconciliation: compare the books").
- **Renderer:** `scene` (data only).
- **Claim:** Reconciliation compares our ledger with the provider's own record and sorts every difference into: matches, a gap the system can fix, or a case for a person.
- **Story:** The job gets 1,000 ids from the provider and 998 from the ledger. Two are missing. pay_412 is confirmed captured and posted (999 now). pay_907 is left for a human. Verdict: "Match it, fix it, or escalate it".
- **Numbers:** 1,000, 998, 999 payments (course example).
- **Sources:** Course design (source needed for how real providers publish settlement reports, see the chapter).
