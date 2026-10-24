# Canvas spec: sysdesign-m18-laptop-vs-server

- **Course and chapter:** system-design, 18.1 beat 1 (Same code, different result).
- **Renderer:** `scene` (data only).
- **Claim:** Code does not run alone. It runs on a Node version, with settings and libraries around it, and those differ between machines.
- **Story:** The laptop says 'tests pass' and sends the code to the server. The server runs an older Node with no settings file and crashes. Users open the app and see an error.
- **Numbers:** None. The versions are examples, not real measurements.
- **Limits shown under the picture:** A made-up story (Daftar, a fictional notes app). The laptop has Node 24 and a local settings file; the server has an older Node and no settings file. Real differences also include libraries, the operating system and file paths.
- **Sources:** None needed. Course composite, not a real incident.
