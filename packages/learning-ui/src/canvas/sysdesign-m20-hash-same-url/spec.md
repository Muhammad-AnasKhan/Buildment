# Canvas spec: sysdesign-m20-hash-same-url

- **Course and chapter:** system-design, 20.3 beat 1 ("Hash the URL, get the same code").
- **Renderer:** `scene` (data only).
- **Claim:** Hashing the long URL makes the code depend only on the URL, so the same URL always gets the same code, which means one shared link.
- **Story:** Ana shortens a URL: Wasla hashes it, cuts it to 7 characters (Qp7k2Mx) and saves one row. Cy shortens the same URL later and is told the same code. Verdict: "Same URL gives one shared link".
- **Numbers:** Code Qp7k2Mx is made up; 7 characters as in the chapter's estimate.
- **Sources:** Arithmetic and course reasoning; no source needed.
