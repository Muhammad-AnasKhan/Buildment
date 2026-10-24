# Canvas spec: sysdesign-m6-fixed-window-edge

- **Course and chapter:** system-design, 6.5 beat 4 ("Fixed windows let a double burst through").
- **Renderer:** `scene` (data only).
- **Claim:** A fixed window resets its count at each boundary, so a client can get up to 2 times the limit in a short stretch around the boundary.
- **Story:** The script sends 5 at 0:59 (all OK, 5 of 5 used); the window resets at 1:00; 5 more pass. Verdict: "10 in 2 seconds; limit is 5 a minute".
- **Numbers:** 5 a minute is made up.
- **Predict before it (in the chapter):** how many of the 10 requests pass.
- **Sources:** derived from the design; the dossier marks fixed window as having no primary source read.
