# FreshMarket stock holds

Claim: a temporary hold reduces available-to-promise before payment changes physical stock. Confirmation decreases both stock and the newly held quantity, leaving availability steady.

Inputs: on-shelf stock (0–20 units, step 1, default 8), existing holds (0–stock units, step 1, default 2), and a new request (1–10 units, step 1, default 3). The model accepts the new hold only when `request <= stock - held`. It shows before checkout, after the hold, and after payment. A refused request changes no counters.

Limits: one product and one new request; the existing holds are valid. The model does not simulate concurrency, hold expiry, payment retries, or the database transaction. The chapter explains those separately.

Placement: `24.04-reserve-vs-decrement.md`, after the available-to-promise formula and before the MongoDB implementation.
