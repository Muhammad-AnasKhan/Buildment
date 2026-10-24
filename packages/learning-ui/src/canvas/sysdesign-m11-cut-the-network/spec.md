# Canvas spec: sysdesign-m11-cut-the-network

- **Course and chapter:** system-design, 11.7, beat 1 "Cut the cable: refuse or answer".
- **Renderer:** custom beat canvas on `BeatFrame`, `use-beat-clock.ts`, `SvgNode` copies and `VerdictBanner`; model in `models/cut-network.ts`. (The kit `cluster` renderer is not built yet; the cable, regions and message chips are drawn here.) Controls: `BeatChoice` for Refuse/Answer and a `BeatButton` for the cable.
- **Claim:** While the network is cut, a system must choose: refuse requests on the side that cannot reach a majority (stay consistent) or answer on both sides (stay available, and let copies diverge).
- **Model:** copies West 1, West 2 (West region) and East, all x = 0. Script after each press of "Cut the cable": Ada (West) writes x = 1; Bao (East) writes x = 2; Cam (East) reads x. West has 2 of 3 copies, a majority.
  - Refuse: Ada's write is accepted (both West copies hold 1); Bao's write and Cam's read are refused with "try again later"; on mending East copies x = 1; copies never disagree.
  - Answer: every side accepts; West holds 1, East holds 2, Cam reads 2 while West says 1; on mending the copies compare and find a clash (1 and 2) that a rule must settle (module 13).
- **Inputs:** a Refuse/Answer choice (default Refuse) and a button "Cut the cable" that becomes "Mend the cable" (and back to "Cut the cable" to play again). Hint: "Cut the cable, then switch the mode."
- **What moves:** the cable breaks into two ends with a red cross; request chips fly to the copies; refused requests bounce back with a red "try again later" chip; accepted writes change the copy's value pill; after mending, value chips cross the cable and the copies either match or show red pills. Four result rows at the bottom state each outcome in words. With reduced motion the final state of the current phase shows.
- **Verdicts:** before the cut "Link up: all three copies agree"; cut + Refuse "East says try again; no clash"; cut + Answer "Both answer; copies now differ"; mended + Refuse "Link back: East catches up"; mended + Answer "Link back: 1 and 2 must be settled".
- **Sources:** [S55] CAP definitions; [S56] the choice is made at fine grain; [S46] availability classes.
