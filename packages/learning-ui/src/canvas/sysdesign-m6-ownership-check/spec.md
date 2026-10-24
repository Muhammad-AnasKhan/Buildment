# Canvas spec: sysdesign-m6-ownership-check

- **Course and chapter:** system-design, 6.6 beat 3 ("Business rules stay with the data").
- **Renderer:** `scene` (data only).
- **Claim:** Object-level authorization needs the object's data, so it belongs in the service that owns the data, not in the gateway.
- **Story:** Huda asks for order 512; the gateway checks her token and passes "user=huda, 512"; the orders service sees 512 is Omar's and answers 404, which the gateway passes back. Verdict: "Orders service said no: not hers".
- **Numbers:** none.
- **Predict before it (in the chapter):** where the "not your order" check should live.
- **Sources:** object-level authorization guidance is a source-needed note in the chapter. Kitabi, Huda and Omar are a course example.
