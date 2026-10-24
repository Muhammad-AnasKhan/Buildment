# Canvas spec: sysdesign-m11-is-it-linearizable

- **Course and chapter:** system-design, 11.3, beat 1 "Find one point inside every bar".
- **Renderer:** custom beat canvas on `BeatFrame`, drawn with the shared history picture (`primitives/history-view.tsx`). Rules: `models/linearizable-play.ts` and the linearizable checker in `models/history.ts`.
- **Claim:** A history is linearizable when one instant can be placed inside every bar, in an order where every read returns the last write before it.
- **Model:** lanes Ada, Ben, Dan, Cam on a time axis from 0 to 90. Ada writes x = 1 from 10 to 60; Ben reads from 20 to 30; Dan from 40 to 50; Cam from 70 to 80. Start value 0. Default reads: Ben 0, Dan 1, Cam 1. A tap flips a read between 0 and 1. After each tap the checker searches for an order that keeps real time (a.end < b.start means a first) and the register rule. If one exists, each operation in that order gets the point max(start, previous point + 1).
- **Check points (all eight settings, tested):** yes for (Ben, Dan, Cam) = (0,0,1) with dots 20, 40, 41, 70 in the order Ben, Dan, Ada, Cam; (0,1,1) with 20, 21, 40, 70 (Ben, Ada, Dan, Cam); (1,1,1) with 10, 20, 40, 70 (Ada, Ben, Dan, Cam). The other five are no.
- **Verdicts:** Cam read 0: "No: Cam missed a finished write" (rings Ada and Cam). Else Ben 1 and Dan 0: "No: Dan saw time go backwards" (rings Ben and Dan). Else "Yes: one order fits every bar".
- **Inputs:** tap a read bar (real button). One control outside the picture: Reset. Hint: "Tap a read to change what it returned."
- **What moves:** dots slide to their points and a thin line joins them in order; with no order the dots fade and the red rings appear (CSS transitions, so the final state shows with motion paused).
- **Accessibility:** each read is a button with its client, value and times; the SVG description lists the reads, the verdict and the order found.
- **Sources:** [S47] linearizable definition; [S52] linearizability and real-time order.
