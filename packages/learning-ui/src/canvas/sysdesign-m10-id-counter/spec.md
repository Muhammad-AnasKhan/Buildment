# Canvas spec: sysdesign-m10-id-counter

- **Course and chapter:** system-design, 10.7 beat 1 ("One counter makes IDs, and is one point of failure").
- **Renderer:** `scene` (data only).
- **Claim:** A single database counter gives unique, ordered IDs but needs a trip to one machine for each ID, and stops everything if that machine is down.
- **Story:** App 1 asks and gets 41, App 2 asks and gets 42. The counter goes down; both apps wait. Verdict: "Counter down: nobody gets an ID".
- **Numbers:** Course numbers.
- **Sources:** Design reasoning for the chapter; no external number.
