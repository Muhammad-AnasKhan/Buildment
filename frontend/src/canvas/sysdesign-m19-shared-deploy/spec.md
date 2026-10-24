# Canvas spec: sysdesign-m19-shared-deploy

- **Course and chapter:** system-design, 19.2 beat 3 ("Zones share fate with the code you ship").
- **Renderer:** `scene` (data only).
- **Claim:** Spreading across zones protects against faults that are local to a zone (power, network, a flood). It does not protect against a fault you deploy to every zone yourself.
- **Story:** A deploy tool pushes release 42 to three zones at once. All three say "running 42", then all three show errors. Verdict: "Same bug everywhere: all zones down".
- **Numbers:** None; the zone count of three is a course example.
- **Sources:** AWS "Fault isolation boundaries" whitepaper, Availability Zones page (zones are separated so a shared-fate event hits one; AWS staggers its own deployments across zones in time). Not yet in the dossier.
