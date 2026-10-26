# Canvas spec: net-m5-laptop-address

Course and chapter: networking, 5.3 beat 2 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`), used in place of the planned network lab (`[netlab]`). Model and schema: `models/net-step.ts`.

## Claim

To reach an app on another computer, use that computer's own address and the app's port. The phone at `192.168.1.57` opens `http://192.168.1.23:3000` and the request reaches the laptop on the same Wi-Fi.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Four steps: the two devices and their addresses; the phone sends the request to `192.168.1.23:3000`; the request reaches the laptop, whose table shows the app listening on `0.0.0.0:3000`; the page comes back. No pick: the beat only shows that the laptop's own address is the one to use.

## Limits

Two made-up devices on one Wi-Fi network, with a web app that listens on every address of the laptop in this picture; the next beats show what changes when it does not. `0.0.0.0` appears only in the listening column, never as an address to browse to. The table is a model, not a recording. No firewall and no Wi-Fi client isolation are drawn.
