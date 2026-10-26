# Canvas spec: net-m5-five-numbers

Course and chapter: networking, 5.2 beat 3 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`), used in place of the planned network lab (`[netlab]`). Model and schema: `models/net-step.ts`.

## Claim

A conversation is named by five numbers: the protocol, the two addresses and the two ports. Two tabs that talk to the same website match in four of them. Only the laptop's port differs, and that is what tells the two conversations apart.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Tab 1 and tab 2 each add a row to two tables (the laptop's end and the website's end). At step 3 the learner first taps which of the five numbers differs (the website's port, the laptop's address, or the laptop's port), and the feedback says why. The picked step then lights both rows of the laptop's end, where the two ports sit side by side.

## Limits

Two made-up conversations over TCP, with ports chosen by the model. The two tables are one list split in two so that each fits on a phone. The website uses a documentation address, the laptop a private one. The tables are a simplified view of what `ss -tn` and `netstat -an` list, not a recording.
