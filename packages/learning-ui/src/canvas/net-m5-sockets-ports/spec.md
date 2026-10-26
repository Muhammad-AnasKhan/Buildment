# Canvas spec: net-m5-sockets-ports

Course and chapter: networking, 5.2 beat 2 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`), used in place of the planned network lab (`[netlab]`). Model and schema: `models/net-step.ts`.

## Claim

A port names one app on a computer. One laptop with one address runs several apps at once, and each app has its own port, so the laptop can tell their traffic apart.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Five steps: the laptop's one address; tab 1 gets port 51234; tab 2 gets port 51236; the chat app gets port 40000; a chat message comes back. At the last step the message arrives with the laptop port 40000 in it, the row for the chat app is lit, and the verdict reads "The port picks the app". There is no pick here: the next beat carries the pick, so the chapter keeps to its budget of three assessments.

## Limits

One made-up laptop and three apps, with ports chosen by the model; a real computer picks its own. The two server addresses come from the documentation ranges. The table is a simplified view of the laptop's sockets, not a recording. A real browser may share one connection between tabs, which is not drawn.
